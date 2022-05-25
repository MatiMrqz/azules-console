import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';

interface TempData {
  done: number,
  accumulated: number
}
interface PumpTempData extends TempData {
  m3: number
}

@Component({
  selector: 'app-operation-edit',
  templateUrl: './operation-edit.component.html',
  styles: [
  ]
})
export class OperationEditComponent implements OnInit {
  public operationDetail: { operation: DetailOperationDB, products: Array<DetailProducts>, pumps: Array<DetailPumps>, accountancy: DetailAccountancy, gralMeter: { meter_diff: number, accumulated: number } }
  public tempData: { acc: TempData, pumps: PumpTempData, products: TempData }
  public products = []
  public pumps = []
  public gralMeter
  public saving = false
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
  }
  constructor(
    private webService: WebService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.tempData = { acc: { done: 0, accumulated: 0 }, products: { done: 0, accumulated: 0 }, pumps: { m3: 0, done: 0, accumulated: 0 } }
  }
  public async getOperation(id: number) {
    this.webService.getOperationDetailbyId(id)
      .then(res => {
        // console.log(res)

        this.operationDetail = res
        this.products = res.products.map(p => {
          return { ...p, items_sold: p.items_sold ?? 0, items_replacement: p.items_replacement ?? 0, end_stock: ((+p.init_stock) + (+p.items_replacement ?? 0) - (+p.items_sold ?? 0)), amount_sold: (+p.amount_sold), validated: true }
        })
        this.refreshDoneProducts()
        this.pumps = res.pumps.map(p => {
          return { ...p, amount_sold: p.amount_sold ?? 0, venting: p.venting ?? 0, meter_diff: p.meter_diff ?? 0, meter_end: (+p.init_meter) + (+p.meter_diff ?? 0) + (+p.venting ?? 0), validated: true, reset_meter: (+p.init_meter + +p.meter_diff ?? 0 + +p.venting ?? 0) < +p.init_meter }
        })
        this.refreshDonePumps()
        this.gralMeter = { validated: true, meter_end: res.gralMeter.accumulated, meter_diff: res.gralMeter.meter_diff, meter: (+res.gralMeter.accumulated - +res.gralMeter.meter_diff) }
        this.acc = { ...res.accountancy, cash_v: true, envelopes_cash_v: true, n_envelopes_v: true, cards_v: true, vouchers_v: true, MercadoPago_v: true, expenses_v: true, others_v: true }
        this.accDoneUpdate()
      })
  }
  public refreshDonePumps(): void {
    var done = 0
    var m3 = 0
    var accumulated = 0
    if (this.pumps.length == 0) return

    this.pumps.forEach(p => {
      if (p.validated) {
        done++;
        m3 += +p.meter_diff
        accumulated += (+p.unit_price * +p.meter_diff)
      }
    })
    this.tempData.pumps = { m3, accumulated, done }

  }
  public refreshDoneProducts(): void {
    var done = 0
    var accumulated = 0
    if (!this.products) return
    this.products.forEach(p => {
      if (p.validated) {
        done++
        accumulated += p.unit_price * p.items_sold
      }
    })
    this.tempData.products = { done, accumulated }
  }
  public calcProd(item) {
    if ((+item.init_stock < 0 || +item.items_sold < 0 || +item.items_replacement < 0 || +item.unit_price < 0) || (item.init_stock == null || item.items_sold == null || item.items_replacement == null || item.unit_price == null)) {
      item.validated = false
    } else {
      item.end_stock = (+item.init_stock) - (+item.items_sold) + (+item.items_replacement)
      item.amount_sold = (+item.items_sold) * (+item.unit_price)
      item.validated = item.end_stock >= 0
    }
    this.refreshDoneProducts()
  }
  public accDoneUpdate(): void {
    var done: number = 0
    if (!this.acc) return
    Object.values(this.acc).forEach(v => {
      if (typeof v == 'boolean' && v === true) done++
    })
    this.tempData.acc = { done, accumulated: (+ +this.acc.MercadoPago + +this.acc.cards + +this.acc.cash + +this.acc.envelopes_cash + +this.acc.others + +this.acc.expenses + +this.acc.vouchers) }
    return
  }
  public calcMeterDiff(i: number) {
    const pI = this.pumps[i]
    if (pI.init_meter == null || pI.meter_end == null || pI.venting == null || pI.unit_price == null) {
      pI.validated = false;
      this.refreshDonePumps()
      return
    }
    pI.reset_meter = +pI.meter_end < +pI.init_meter
    pI.meter_diff = pI.reset_meter ? (+pI.max_meter_value - +pI.init_meter) + pI.meter_end - +pI.venting : +pI.meter_end - +pI.init_meter - +pI.venting
    pI.validated = (pI.meter_end != null && pI.venting != null && (pI.meter_diff >= 0 || pI.reset_meter))
    this.refreshDonePumps()
  }
  public saveOperation(operation: { observation: string, adminPass: string }) {
    this.saving = true
    const pumps_operation_snapshot = this.pumps.filter(pu => {
      const refPump = this.operationDetail.pumps.find(refP => refP.pump_id == pu.pump_id)
      return (pu.init_meter != refPump.init_meter) || (pu.unit_price != refPump.unit_price)
    }).map(p => {
      return { pump_id: p.pump_id, unit_price: +p.unit_price, init_meter: +p.init_meter }
    })
    const pumps_operation = this.pumps.filter(pu => {
      const refPump = this.operationDetail.pumps.find(refP => refP.pump_id == pu.pump_id)
      return (pu.meter_diff != +(refPump.meter_diff ?? 0)) || (pu.venting != +(refPump.venting ?? 0) || (pu.amount_sold != +(refPump.amount_sold ?? 0)))
    }).map(p => {
      return { pump_id: p.pump_id, meter_diff: +p.meter_diff, venting: +p.venting, amount_sold: +p.amount_sold }
    })
    const gralMeter = (+this.gralMeter.meter_end != +this.operationDetail.gralMeter.accumulated || +this.gralMeter.meter_diff != +this.operationDetail.gralMeter.meter_diff) ? { accumulated: this.gralMeter.meter_end, meter_diff: this.gralMeter.meter_diff } : null
    const products_operations_snapshot = this.products.filter(pr => {
      const refProduct = this.operationDetail.products.find(refP => refP.id == pr.id)
      return (+pr.init_stock != +refProduct.init_stock || +pr.unit_price != +refProduct.unit_price)
    }).map(ps => {
      return { product_id: +ps.id, unit_price: +ps.unit_price, init_stock: +ps.init_stock }
    })
    const products_operations = this.products.filter(pr => {
      const refProduct = this.operationDetail.products.find(refP => refP.id == pr.id)
      pr.amount_sold = Math.round((+pr.amount_sold + Number.EPSILON) * 100) / 100
      return (+pr.items_sold != +(refProduct.items_sold ?? 0) || +pr.items_replacement != (refProduct.items_replacement ?? 0) || pr.amount_sold != +(refProduct.amount_sold ?? 0))
    }).map(ps => {
      return { product_id: +ps.id, items_sold: +ps.items_sold, items_replacement: +ps.items_replacement, amount_sold: +ps.amount_sold }
    })
    const accountancy = (this.acc.MercadoPago != +this.operationDetail.accountancy.MercadoPago ||
      this.acc.cards != +this.operationDetail.accountancy.cards ||
      this.acc.cash != +this.operationDetail.accountancy.cash ||
      this.acc.cash != +this.operationDetail.accountancy.cash ||
      this.acc.envelopes_cash != +this.operationDetail.accountancy.envelopes_cash ||
      this.acc.expenses != +this.operationDetail.accountancy.expenses ||
      this.acc.n_envelopes != +this.operationDetail.accountancy.n_envelopes ||
      this.acc.vouchers != +this.operationDetail.accountancy.vouchers ||
      this.acc.others != +this.operationDetail.accountancy.others) ? {
      MercadoPago: +this.acc.MercadoPago,
      cards: +this.acc.cards,
      cash: +this.acc.cash,
      envelopes_cash: +this.acc.envelopes_cash,
      expenses: +this.acc.expenses,
      n_envelopes: +this.acc.n_envelopes,
      vouchers: +this.acc.vouchers,
      others: +this.acc.others
    } : null
    if (pumps_operation_snapshot.length == 0 && pumps_operation.length == 0 && gralMeter == null && products_operations.length == 0 && products_operations_snapshot.length == 0 && accountancy == null) {
      this.showError('No hay cambios por guardar')
      setTimeout(() => {
        this.saving = false
      }, 1000)
      return
    }
    const payload = {
      pumps_operation_snapshot,
      pumps_operation,
      gralMeter,
      products_operations_snapshot,
      products_operations,
      accountancy,
      turn:null,
      observations: operation.observation,
      adminPass: operation.adminPass
    }
    // console.log({ operation, pumps_operation_snapshot, pumps_operation, gralMeter, products_operations_snapshot, products_operations, accountancy, observations: operation.observation })
    this.webService.editOperation(this.operationDetail.operation.id, payload)
      .then(res => {
        if (res.msg.includes('Success')) this.showSuccess('Cambios guardados correctamente!')
        setTimeout(() => {
          this.saving = false
          this.router.navigate([`/operations/detail/${this.operationDetail.operation.id}`])
        }, 500)
      })
      .catch(err => {
        if (err.includes('Wrong password')) this.showError('Contraseña errónea')
        this.saving = false
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
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.getOperation(id)
  }

}
