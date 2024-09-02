import { Component, HostListener, OnInit, Pipe, PipeTransform, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewInvoiceComponent } from 'src/app/modals/new-invoice/new-invoice.component';
import { EscposPrintService } from 'src/app/services/escpos-print.service';
import { WebService } from 'src/app/services/web.service';

interface TempData {
  done: number,
  accumulated: number
}

@Pipe({ name: 'validProducts' })
export class ValidProductsPipe implements PipeTransform {
  transform(value: EditedProducts[]): Array<EditedProducts> {
    return value.filter(v => { return v.hidden == false })
  }
}
@Component({
  selector: 'app-close-turn',
  templateUrl: './close-turn.component.html',
  styles: [
  ]
})

export class CloseTurnComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    return false;
  }
  @HostListener('window:unload', ['$event'])
  public tempData: { acc: TempData, posop: TempData, products: TempData }
  public turn: { name: string, schedule: string }
  public employee: { uuid: string, uname: string } = { uname: '-', uuid: '' }
  public saving: boolean = false
  public products: Array<EditedProducts> = []
  public PoS: Array<EditedPoS> = []
  public categories = []
  public helpers = []
  public helperSelected = null
  public isLoading: boolean = true
  public acc: {
    cash: number,
    cashbacks: number,
    vouchers: number,
    mp_transf: number,
    recharges: number,
    pays_upfront: number,
    others: number,
    cash_v?: boolean,
    cashbacks_v?: boolean,
    vouchers_v?: boolean,
    mp_transf_v?: boolean,
    recharges_v?: boolean,
    pays_upfront_v: boolean,
    others_v?: boolean
  }

  public pin = signal("")
  public observation = signal("")
  public savingDisabled: boolean = true
  public invoicingEnabled = signal(false)
  public serverResponse: any = { error: null, msg: 'Realizando cierre de turno.' }

  constructor(
    private webService: WebService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private escposService: EscposPrintService
  ) {
    this.webService.getDevSettings().then((settings) => {
      this.invoicingEnabled.set(settings.INVOICING_ENABLED)
    })
    this.acc = this.getTemp('ACC') ?? {
      cash: null,
      cashbacks: null,
      vouchers: null,
      mp_transf: null,
      recharges: null,
      pays_upfront: null,
      others: null,
    }
    this.tempData = this.getTemp('TEMP') ?? { acc: { done: 0, accumulated: 0 }, products: { done: 0, accumulated: 0 }, posop: { done: 0, accumulated: 0 } }
  }

  ngOnInit(): void {
    const subs = this.route.data.subscribe((data: OperationEmpDB) => {
      this.employee = { uname: data.uname, uuid: data.employee_uuid }
      this.turn = { name: data.turn_name, schedule: data.turn_schedule }
    })
    subs.unsubscribe()
    this.getAll()
  }

  private getAll() {
    this.isLoading = true
    Promise.all([
      this.getCategories(),
      this.getProducts(),
      this.getHelpers(),
      this.getPoS()
    ]).then(() => {
      this.isLoading = false
    })
  }
  private async getPoS() {
    const tempPoS = await this.webService.getAllPoSDev()
    this.PoS = this.getTemp('POS') ?? tempPoS.map(p => {
      return { amount_sold: null, sales_in: null, sales_out: null, validated: null, ...p }
    })
  }
  private async getProducts() {
    const tempProducts = await this.webService.getAllProductsDev()
    this.products = this.getTemp('PRODUCTS') ?? tempProducts.map(p => {
      return { items_sold: p.stock == 0 ? 0 : null, items_replacement: null, end_stock: null, validated: null, ...p }
    })
  }
  private async getCategories() {
    this.categories = await this.webService.getAllCategoriesDev()
  }
  private async getHelpers() {
    this.helpers = await this.webService.getHelpersDev()
  }
  public getCategorybyId(id?: number) {
    if (!id) return null
    return this.categories.find(c => c.id == id) ?? '-'
  }
  public refreshDonePoS(): void {
    let done = 0
    let accumulated = 0
    if (!this.PoS) return
    this.PoS.forEach(p => {
      if (p.validated) {
        done++
        accumulated += p.unit_price * (p.sales_in - p.sales_out)
      }
    })
    this.tempData.posop = { done, accumulated }
    this.storeTemp('POS', this.PoS)
    this.storeTemp('TEMP', this.tempData)
  }
  public refreshDoneProducts(): void {
    let done = 0
    let accumulated = 0
    if (!this.products) return
    this.products.forEach(p => {
      if (p.validated) {
        done++
        accumulated += p.unit_price * p.items_sold
      }
    })
    this.tempData.products = { done, accumulated }
    this.storeTemp('PRODUCTS', this.products)
    this.storeTemp('TEMP', this.tempData)
  }
  public accDoneUpdate(): void {
    let done: number = 0
    if (!this.acc) return
    Object.values(this.acc).forEach(v => {
      if (typeof v == 'boolean' && v === true) done++
    })
    this.tempData.acc = { done, accumulated: (+ this.acc.mp_transf + this.acc.cashbacks + this.acc.cash + this.acc.others + this.acc.recharges + this.acc.vouchers) }
    this.storeTemp('ACC', this.acc)
    this.storeTemp('TEMP', this.tempData)
    return
  }

  public formErrorMsgs(): string {
    const val = this.pin()
    const obs = this.observation()
    if (this.acc.pays_upfront > 0 && !obs.length) {
      this.savingDisabled = true
      return 'Rendición:Pagos/Adelantos requiere una observación'
    }
    if (this.acc.others > 0 && !obs.length) {
      this.savingDisabled = true
      return 'Rendición:Otros requiere una observación'
    }
    const status = (this.tempData.posop.done == this.PoS.length) && (this.tempData.products.done == this.products.filter(p => p.hidden == false).length) && (this.tempData.acc.done == 7)
    if (!status) {
      this.savingDisabled = true
      return 'Planilla incompleta'
    }
    if (val.length < 4) {
      this.savingDisabled = true
      return 'Ingrese pin'
    }
    this.savingDisabled = false
    return ''
  }
  public storeClosingShift(observations: string, pass: string, content) {
    this.saving = true
    this.modalService.open(content, {
      keyboard: false,
      backdrop: 'static'
    }).result.then(
      () => { }
    ).finally(() => {
      this.serverResponse = { error: null }
    })
    const product_operations = this.products.map(p => {
      if (p.validated && (p.items_sold != 0 || p.items_replacement != 0)) {
        return { product_id: p.id, items_sold: p.items_sold, items_replacement: p.items_replacement, unit_price: p.unit_price, prev_stock: p.stock }
      }
    }).filter(Boolean)
    const posop_operations = this.PoS.map(p => {
      if (p.validated) {
        return { posop_id: p.id, sales_in: p.sales_in, sales_out: p.sales_out, unit_price: p.unit_price }
      }
    }).filter(Boolean)
    const accountancy = {
      cash: this.acc.cash,
      cashbacks: this.acc.cashbacks,
      vouchers: this.acc.vouchers,
      mp_transf: this.acc.mp_transf,
      recharges: this.acc.recharges,
      pays_upfront: this.acc.pays_upfront,
      others: this.acc.others
    }
    this.serverResponse = { error: null, msg: 'Realizando cierre de turno...' }
    this.webService.shiftClosingDev({ employee: { uuid: this.employee.uuid, pass }, helper_id: (this.helperSelected ? this.helperSelected.uuid : null), posop_operations, product_operations, accountancy, turn: this.turn, observations })
      .then(res => {
        this.cleanTemp()
        this.serverResponse = { ...res, observations, accountancy }
        this.saving = false
        if (this.invoicingEnabled()) {
          this.print()
        } else {
          this.serverResponse = { ...this.serverResponse, ...{ msg: 'Operación registrada', error: 4 } }
        }
      })
      .catch((err) => {
        this.saving = false
        if (err instanceof (Error)) {
          this.serverResponse = { error: 1, msg: err.message }
        } else {
          if (err.includes('password')) this.serverResponse = { error: 1, msg: 'Contraseña incorrecta. Intente nuevamente.' }
          else this.serverResponse = { error: 1, msg: err }
        }
      })
  }
  private storeTemp(name: 'POS' | 'PRODUCTS' | 'ACC' | 'TEMP', payload: any) {
    sessionStorage.setItem(name, JSON.stringify(payload))
  }
  private getTemp(name: 'POS' | 'PRODUCTS' | 'ACC' | 'TEMP'): any {
    return JSON.parse(sessionStorage.getItem(name))
  }
  private cleanTemp() {
    sessionStorage.removeItem('POS')
    sessionStorage.removeItem('PRODUCTS')
    sessionStorage.removeItem('ACC')
    sessionStorage.removeItem('TEMP')
  }

  public print() {
    this.serverResponse = { ...this.serverResponse, ...{ msg: 'Imprimiendo comprobante...', error: null } }
    console.log(this.serverResponse)
    this.escposService.printShiftSummary(this.serverResponse.id, this.turn, this.employee, (this.helperSelected ?? null), this.serverResponse.emitter, this.products, this.serverResponse.accountancy, { accountancy: this.tempData.acc.accumulated, products: this.tempData.products.accumulated, posop: this.tempData.posop.accumulated }, this.serverResponse.nInvoicesDone, this.serverResponse.observations)
      .then(res => {
        if (res.success) {
          this.serverResponse = { ...this.serverResponse, ...{ msg: 'Impresion finalizada', error: 2 } }
        } else {
          this.serverResponse = { ...this.serverResponse, ...{ msg: 'Error al imprimir: ' + res.data, error: 3 } }
        }
      })
      .catch((err) => {
        if (err instanceof (Error)) {
          this.serverResponse = { ...this.serverResponse, ...{ msg: 'Error de comunicación con impresora:' + err.message, error: 3 } }
        } else {
          this.serverResponse = { ...this.serverResponse, ...{ msg: 'Error de comunicación con impresora:' + err, error: 3 } }
        }
      })
  }

  public continueButton() {
    setTimeout(() => {
      this.modalService.dismissAll()
      this.router.navigate(['employee'])
    }, 100)
  }

  public newInvoice() {
    const modalRef = this.modalService.open(NewInvoiceComponent,
      {
        container: 'app-close-turn',
        keyboard: false,
        backdrop: 'static',
        size: 'xl'
      })
    modalRef.componentInstance.employee = this.employee
    modalRef.result.then(
      (closed: string) => {
        console.debug(`Closed reason: ${closed}`)
      },
      () => { }
    )
  }

}
