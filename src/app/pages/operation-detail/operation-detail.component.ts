import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NgxPrinterService } from 'ngx-printer';
@Component({
  selector: 'app-operation-detail',
  templateUrl: './operation-detail.component.html',
  styles: []
})
export class OperationDetailComponent implements OnInit {

  @Input() operationDetail: (OperationDetail & OperationRev)

  constructor(
    private printerService: NgxPrinterService,
  ) { }
  public productTotalAmount(): number {
    var total: number = 0
    this.operationDetail.products.forEach(p => {
      total += +p.amount_sold
    })
    return total
  }
  public posopTotalAmount(): number {
    var total: number = 0
    this.operationDetail.posop.forEach(p => {
      total += +p.amount_sold
    })
    return total
  }
  public accTotalAmount(): number {
    let acc = this.operationDetail.accountancy
    return +acc.MercadoPago + +acc.cards + +acc.cash + +acc.envelopes_cash + +acc.others + +acc.expenses + +acc.vouchers
  }
  public print(template: TemplateRef<HTMLTemplateElement>) {
    this.printerService.printAngular(template)
  }
  ngOnInit(): void {
  }
}
