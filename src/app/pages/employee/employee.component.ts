import { Component, HostListener, OnInit, Pipe, PipeTransform } from '@angular/core';
import { WebService } from 'src/app/services/web.service';

@Pipe({ name: 'validProducts' })
export class ValidProductsPipe implements PipeTransform {
  transform(value: Products[]): unknown {
    return value.filter(v => { return v.hidden == false })
  }
}
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styles: [
  ]
})

export class EmployeeComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    return false;
  }

  public products = []
  public categories = []
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
    private webService: WebService
  ) { }

  ngOnInit(): void {
    this.getAll()
  }

  private getAll() {
    this.isLoading = true
    Promise.all([
      this.updateCategories(),
      this.updateProducts(),
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
      // if (p.hidden) return
      return { items_sold: p.stock == 0 ? 0 : null, items_replacement: null, end_stock: null, validated: null, ...p }
    })
    console.log(this.products)
  }
  private async updateCategories() {
    this.categories = await this.webService.getAllCategoriesDev()
    console.log(this.categories)
  }
  public getCategorybyId(id?: number) {
    if (!id) return null
    return this.categories.find(c => c.id == id) ?? '-'
  }

  public async updatePumps() {
    const tempPumps = await this.webService.getAllPumpsDev()
    this.pumps = tempPumps.map(p => {
      return { venting: null, meter_end: null, meter_diff: null, validated: null, ...p }
    })
    console.log(this.pumps)
  }

  public async updateGralMeter() {
    const tempMeter = await this.webService.getGralMeterDev()
    this.gralMeter = { validated: null, meter_diff: null, meter_end: null, ...tempMeter }
    console.log(this.gralMeter)
  }

  public async getPumpTypes() {
    this.pump_types = await this.webService.getAllPumpTypesDev()
    console.log(this.pump_types)
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
  public accTotalAmount(): number {
    return this.acc.MercadoPago + this.acc.cards + this.acc.cash + this.acc.envelopes_cash + this.acc.others - this.acc.expenses - this.acc.vouchers;
  }
  public saveDisabled(val?:string): boolean {
    const status = !!val && (this.refreshDonePumps() == this.pumps.length) && this.gralMeter.validated===true && (this.refreshDoneProducts() == this.products.filter(p => p.hidden == false).length) && (this.accDoneUpdate() == 8)
    return !status
  }
  public print(val:any){
    console.log(val)
  }
  public storeClosingShift(observations: string, pass: string) {
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
    const employee = { uuid: '64fe5e68-93e4-11ec-936d-e45a16609df4', pass }//HARDCODED
    const turn = { name: 'PRUEBA', schedule: 'H1-H2' }
    console.log({ employee, pump_operations, product_operations, gral_meter, accountancy, turn, observations })
    this.webService.shiftClosingDev({ employee, pump_operations, product_operations, gral_meter, accountancy, turn, observations })
  }
}
