import { Component, HostListener, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';

@Pipe({ name: 'validProducts' })
export class ValidProductsPipe implements PipeTransform {
  transform(value: Products[]): unknown {
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
  public turn: { name: string, schedule: string }
  public employee: { uuid: string, uname: string } = { uname: '-', uuid: '' }
  public saving: boolean = false
  public products = []
  public categories = []
  public helpers = []
  public helperSelected = null
  public gralMeter
  public pumps = []
  public pump_types = []
  public isLoading: boolean = true
  public acc: {
    cash: number,
    envelopes_cash: number,
    n_envelopes: number,
    cards: number,
    vouchers: number,
    MercadoPago: number,
    expenses: number,
    others: number,
    cash_v?: boolean,
    envelopes_cash_v?: boolean,
    n_envelopes_v?: boolean,
    cards_v?: boolean,
    vouchers_v?: boolean,
    MercadoPago_v?: boolean,
    expenses_v?: boolean,
    others_v?: boolean
  } = {
      cash: null,
      envelopes_cash: null,
      n_envelopes: null,
      cards: null,
      vouchers: null,
      MercadoPago: null,
      expenses: null,
      others: null
    }
  public accDoneCounter: number = 0

  constructor(
    private webService: WebService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) { }

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
      this.updateCategories(),
      this.updateProducts(),
      this.updateHelpers(),
      this.updatePumps(),
      this.getPumpTypes(),
      this.updateGralMeter()
    ]).then(() => {
      this.isLoading = false
    })
  }
  private async updateProducts() {
    const tempProducts = await this.webService.getAllProductsDev()
    this.products = tempProducts.map(p => {
      return { items_sold: p.stock == 0 ? 0 : null, items_replacement: null, end_stock: null, validated: null, ...p }
    })
  }
  private async updateCategories() {
    this.categories = await this.webService.getAllCategoriesDev()
  }
  private async updateHelpers() {
    this.helpers = await this.webService.getHelpersDev()
  }
  public getCategorybyId(id?: number) {
    if (!id) return null
    return this.categories.find(c => c.id == id) ?? '-'
  }

  public async updatePumps() {
    const tempPumps = await this.webService.getAllPumpsDev()
    this.pumps = tempPumps.map(p => {
      return { venting: null, meter_end: null, meter_diff: null, validated: null, reset_meter: false, ...p }
    })
  }

  public async updateGralMeter() {
    const tempMeter = await this.webService.getGralMeterDev()
    this.gralMeter = { validated: null, meter_diff: null, meter_end: null, ...tempMeter }
  }

  public async getPumpTypes() {
    this.pump_types = await this.webService.getAllPumpTypesDev()
  }
  public getTypebyId(id: number) {
    return this.pump_types.find(c => c.id == id) ?? '-'
  }
  public refreshDonePumps(): number {
    var count = 0
    if (!this.pumps) return 0
    this.pumps.forEach(p => {
      if (p.validated) count++
    })
    return count
  }

  public refreshDoneProducts(): number {
    var count = 0
    if (!this.products) return 0
    this.products.forEach(p => {
      if (p.validated) count++
    })
    return count
  }
  public accDoneUpdate(): number {
    var count: number = 0
    if (!this.acc) return 0
    Object.values(this.acc).forEach(v => {
      if (typeof v == 'boolean' && v === true) count++
    })
    return count;
  }
  public productTotalAmount(): number {
    let amount: number = 0
    if (!this.products) return 0
    this.products.forEach(v => {
      if (v.validated) amount += v.unit_price * v.items_sold
    })
    return amount
  }
  public pumpTotalAmount(): number {
    let amount: number = 0
    if (!this.pumps) return 0
    this.pumps.forEach(v => {
      if (v.validated) amount += v.meter_diff * v.unit_price
    })
    return amount
  }
  public pumpm3Amount():number{
    let amount: number = 0
    if (!this.pumps) return 0
    this.pumps.forEach(v => {
      if (v.validated) amount += v.meter_diff
    })
    return amount
  }
  public accTotalAmount(): number {
    return this.acc.MercadoPago + this.acc.cards + this.acc.cash + this.acc.envelopes_cash + this.acc.others + this.acc.expenses + this.acc.vouchers;
  }
  public saveDisabled(val?: string): boolean {
    const status = !!val && (this.refreshDonePumps() == this.pumps.length) && this.gralMeter.validated === true && (this.refreshDoneProducts() == this.products.filter(p => p.hidden == false).length) && (this.accDoneUpdate() == 8)
    return !status
  }

  public calcMeterDiff(i: number) {
    const pumpItem = this.pumps[i]
    if(+pumpItem.meter_end > +pumpItem.meter) pumpItem.reset_meter = false
    pumpItem.meter_diff = pumpItem.reset_meter ? (+pumpItem.max_meter_value - +pumpItem.meter) + pumpItem.meter_end - +pumpItem.venting : +pumpItem.meter_end - +pumpItem.meter - +pumpItem.venting
    pumpItem.validated = (pumpItem.meter_end != null && pumpItem.venting != null && (pumpItem.meter_diff >= 0 || pumpItem.reset_meter))
  }

  public storeClosingShift(observations: string, pass: string) {
    this.saving = true
    const pump_operations = this.pumps.map(p => {
      if (p.meter == p.meter_end) return
      else {
        return { pump_id: p.id, meter_diff: p.meter_diff, venting: p.venting }
      }
    }).filter(p => p != undefined)
    const product_operations = this.products.map(p => {
      if (p.validated && (p.items_sold != 0 || p.items_replacement != 0)) {
        return { product_id: p.id, items_sold: p.items_sold, items_replacement: p.items_replacement }
      }
    }).filter(p => p != undefined)
    const gral_meter = { meter_diff: this.gralMeter.meter_diff, accumulated: this.gralMeter.meter_end }
    const accountancy = {
      cash: this.acc.cash,
      envelopes_cash: this.acc.envelopes_cash,
      n_envelopes: this.acc.n_envelopes,
      cards: this.acc.cards,
      vouchers: this.acc.vouchers,
      MercadoPago: this.acc.MercadoPago,
      expenses: this.acc.expenses,
      others: this.acc.others
    }
    console.log({ pump_operations, product_operations, gral_meter, accountancy, turn: this.turn,helper_id:this.helperSelected, observations })
    this.webService.shiftClosingDev({ employee: { uuid: this.employee.uuid, pass }, helper_id:this.helperSelected, pump_operations, product_operations, gral_meter, accountancy, turn: this.turn, observations })
      .then(res => {
        this.showSuccess(res.msg)
        setTimeout(() => {
          this.router.navigate(['employee'])
        }, 500
        )
      })
      .catch((err: string) => {
        this.saving = false
        if (err.includes('password')) err = 'Contraseña errónea. Intente nuevamente.'
        this.showError(err)
      })
  }
  private showError(msg: string) {
    this.toastr.error('<span class="tim-icons icon-simple-remove" [data-notify]="icon"></span>' + msg, '', {
      timeOut: 5000,
      enableHtml: true,
      toastClass: "alert alert-danger alert-with-icon",
      positionClass: 'toast-top-center'
    });
  }

  private showSuccess(msg: string) {
    this.toastr.success('<span class="tim-icons icon-check-2" [data-notify]="icon"></span>' + msg, '', {
      timeOut: 5000,
      enableHtml: true,
      toastClass: "alert alert-success alert-with-icon",
      positionClass: 'toast-top-center'
    });
  }

  public async showModal(content, i: number) {
    this.modalService.open(content).result.then(
      () => {
        this.pumps[i].reset_meter = true
        this.calcMeterDiff(i)
      },
      ()=>{}
    )
  }
}
