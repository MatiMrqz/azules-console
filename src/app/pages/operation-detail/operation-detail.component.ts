import { Component, Input, OnInit } from '@angular/core';
import { NgxPrinterService } from 'ngx-printer';
@Component({
  selector: 'app-operation-detail',
  templateUrl: './operation-detail.component.html',
  styles: []
})
export class OperationDetailComponent implements OnInit {
  public version: 'ORIGINAL' | 'REVIEWED' | null
  public rev: Array<{ id: number | null, name: string }>
  public saving: boolean = false
  public passedSaving: boolean = false

  @Input() operationDetail: { rev: { id: number, name: string }, operation: DetailOperationDB, products: Array<DetailProducts>, pumps: Array<DetailPumps>, accountancy: DetailAccountancy, operationBackups: OperationBackup[] }

  constructor(
    private printerService: NgxPrinterService,
  ) { }
  public pumpTotalAmount(): number {
    var total: number = 0
    this.operationDetail.pumps.forEach(p => {
      total += +p.amount_sold
    })
    return total
  }
  public pumpm3Amount(): number {
    let amount: number = 0
    if (!this.operationDetail.pumps) return 0
    this.operationDetail.pumps.forEach(v => {
      amount += +v.meter_diff
    })
    return amount
  }
  public productTotalAmount(): number {
    var total: number = 0
    this.operationDetail.products.forEach(p => {
      total += +p.amount_sold
    })
    return total
  }
  public accTotalAmount(): number {
    let acc = this.operationDetail.accountancy
    return +acc.MercadoPago + +acc.cards + +acc.cash + +acc.envelopes_cash + +acc.others + +acc.expenses + +acc.vouchers
  }
  public print(template: HTMLTemplateElement) {
    this.printerService.printAngular(template)
  }
  ngOnInit(): void {
  }
}
