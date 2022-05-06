import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPrinterService } from 'ngx-printer';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-operation-detail',
  templateUrl: './operation-detail.component.html',
  styles: []
})
export class OperationDetailComponent implements OnInit {
  public operationDetail: { operation: DetailOperationDB, products: Array<DetailProducts>, pumps: Array<DetailPumps>, accountancy: DetailAccountancy }
  public isLoading: boolean = true
  constructor(
    private route: ActivatedRoute,
    private webService: WebService,
    private printerService: NgxPrinterService
  ) { }
  public async getOperation() {
    this.isLoading = true
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.webService.getOperationDetailbyId(id)
      .then(res => {
        this.operationDetail = res
        console.log(res)
        this.isLoading = false
      })
  }
  public pumpTotalAmount():number{
    var total:number = 0
    this.operationDetail.pumps.forEach(p=>{
      total+= +p.amount_sold
    })
    return total
  }
  public productTotalAmount():number{
    var total:number=0
    this.operationDetail.products.forEach(p=>{
      total+= +p.amount_sold
    })
    return total
  }
  public accTotalAmount():number{
    return +this.operationDetail.accountancy.MercadoPago + +this.operationDetail.accountancy.cards + +this.operationDetail.accountancy.cash + +this.operationDetail.accountancy.envelopes_cash + +this.operationDetail.accountancy.others + +this.operationDetail.accountancy.expenses + +this.operationDetail.accountancy.vouchers
  }
  public print(template:HTMLTemplateElement){
    this.printerService.printAngular(template)
  }
  ngOnInit(): void {
    this.getOperation()
  }

}
