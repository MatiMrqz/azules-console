import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';

interface TempData {
  done: number,
  accumulated: number
}
interface DetailProductsValidated extends DetailProducts {
  validated: boolean
}
interface DetailPoSValidated extends DetailPoS {
  validated: boolean
}

@Component({
  selector: 'app-operation-edit',
  templateUrl: './operation-edit.component.html',
  styles: [
  ]
})
export class OperationEditComponent implements OnInit {
  public isLoading: boolean = true
  public operationDetail: OperationDetail
  public tempData: { acc: TempData, posop: TempData, products: TempData }
  public products: Array<DetailProductsValidated> = []
  public posop: Array<DetailPoSValidated> = []
  public saving = false
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
  constructor(
    private webService: WebService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.tempData = { acc: { done: 0, accumulated: 0 }, products: { done: 0, accumulated: 0 }, posop: { done: 0, accumulated: 0 } }
  }
  public async getOperation(id: number) {
    this.isLoading = true
    this.webService.getOperationDetailbyId(id)
      .then(res => {
        // console.log(res)

        this.operationDetail = res
        this.products = res.products.map<DetailProductsValidated>(p => {
          return { ...p, items_sold: p.items_sold ?? 0, items_replacement: p.items_replacement ?? 0, end_stock: ((+p.init_stock) + (+p.items_replacement ?? 0) - (+p.items_sold ?? 0)), amount_sold: (+p.amount_sold), validated: true }
        })
        this.refreshDoneProducts()
        this.posop = res.posop.map<DetailPoSValidated>(p => { return { ...p, validated: true } })
        this.refreshDonePoS()
        this.acc = { ...res.accountancy, cash_v: true, cashbacks_v: true, vouchers_v: true, mp_transf_v: true, recharges_v: true, pays_upfront_v: true, others_v: true }
        this.accDoneUpdate()
        this.isLoading = false
      })
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
  public refreshDonePoS(): void {
    var done = 0
    var accumulated = 0
    if (!this.posop) return
    this.posop.forEach(p => {
      if (p.validated) {
        done++
        accumulated += +p.unit_price * +p.sales_in - +p.sales_out
      }
    })
    this.tempData.posop = { done, accumulated }
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
  public calcPos(item: DetailPoSValidated) {
    if (item.init_checkout == null || item.sales_in == null || item.sales_out == null || +item.sales_in < 0 || +item.sales_out < 0) {
      item.validated = false
    } else {
      item.amount_sold = ((+item.sales_in - +item.sales_out) * (+item.unit_price)).toString()
      item.validated = Boolean(Object.values(item))
    }
    this.refreshDonePoS()
  }

  public accDoneUpdate(): void {
    var done: number = 0
    if (!this.acc) return
    Object.values(this.acc).forEach(v => {
      if (typeof v == 'boolean' && v === true) done++
    })
    this.tempData.acc = { done, accumulated: (+ +this.acc.cash + +this.acc.cashbacks + +this.acc.vouchers + +this.acc.mp_transf + +this.acc.recharges + +this.acc.pays_upfront + +this.acc.others) }
    return
  }

  public saveOperation(operation: { observation: string, adminPass: string }) {
    this.saving = true
    const posop_operations_snapshot = this.posop.filter(pr => {
      const refPoS = this.operationDetail.posop.find(refP => refP.posop_id == pr.posop_id)
      return (+pr.init_checkout != +refPoS.init_checkout || +pr.unit_price != +refPoS.unit_price)
    }).map(ps => {
      return { posop_id: +ps.posop_id, unit_price: +ps.unit_price, init_checkout: +ps.init_checkout }
    })
    const posop_operation = this.posop.filter(pr => {
      const refPoS = this.operationDetail.posop.find(refP => refP.posop_id == pr.posop_id)
      pr.amount_sold = (Math.round((+pr.amount_sold + Number.EPSILON) * 100) / 100).toString()
      return (+pr.sales_in != +(refPoS.sales_in ?? 0) || +pr.sales_out != (refPoS.sales_out ?? 0) || pr.amount_sold != (refPoS.amount_sold ?? 0))
    }).map(ps => {
      return { posop_id: +ps.posop_id, sales_in: +ps.sales_in, sales_out: +ps.sales_out, amount_sold: +ps.amount_sold }
    })
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
    const accountancy = (
      this.acc.cash != +this.operationDetail.accountancy.cash ||
      this.acc.cashbacks != +this.operationDetail.accountancy.cashbacks ||
      this.acc.vouchers != +this.operationDetail.accountancy.vouchers ||
      this.acc.mp_transf != +this.operationDetail.accountancy.mp_transf ||
      this.acc.recharges != +this.operationDetail.accountancy.recharges ||
      this.acc.pays_upfront != +this.operationDetail.accountancy.pays_upfront ||
      this.acc.others != +this.operationDetail.accountancy.others)
      ?
      {
        cash: +this.acc.cash,
        cashbacks: +this.acc.cashbacks,
        vouchers: +this.acc.vouchers,
        mp_transf: +this.acc.mp_transf,
        recharges: +this.acc.recharges,
        pays_upfront: +this.acc.pays_upfront,
        others: +this.acc.others,
      }
      :
      null
    if (posop_operation.length == 0 && posop_operations_snapshot.length == 0 && products_operations.length == 0 && products_operations_snapshot.length == 0 && accountancy == null) {
      this.showError('No hay cambios por guardar')
      setTimeout(() => {
        this.saving = false
      }, 1000)
      return
    }
    const payload = {
      posop_operations_snapshot,
      posop_operation,
      products_operations_snapshot,
      products_operations,
      accountancy,
      turn: null,
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
