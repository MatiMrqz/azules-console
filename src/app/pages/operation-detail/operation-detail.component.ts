import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPrinterService } from 'ngx-printer';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-operation-detail',
  templateUrl: './operation-detail.component.html',
  styles: []
})
export class OperationDetailComponent implements OnInit {
  public operationDetail: { operation: DetailOperationDB, products: Array<DetailProducts>, pumps: Array<DetailPumps>, accountancy: DetailAccountancy, accountancy_bkp: DetailAccountancy | null }
  public version: 'ORIGINAL' | 'REVIEWED' | null
  public isLoading: boolean = true
  public saving: boolean = false
  constructor(
    private route: ActivatedRoute,
    private webService: WebService,
    private printerService: NgxPrinterService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }
  public async getOperation() {
    this.isLoading = true
    const id = Number(this.route.snapshot.paramMap.get('id'))
    // this.version = this.route.snapshot.queryParamMap.get('version') as 'ORIGINAL'|'REVIEWED'|null
    this.route.queryParams.subscribe(
      param => {
        this.version = param.version
      }
    )
    this.webService.getOperationDetailbyId(id)
      .then(res => {
        this.operationDetail = res
        console.log(res)
        this.isLoading = false
      })
  }
  public async editModal(content) {
    this.modalService.open(content, {
      container: 'app-root'
    }).result
      .then(() => {
      })
      .catch(
        () => { }
      )
  }
  public accountValid(): object {
    if (this.version == 'ORIGINAL') {
      return this.operationDetail.accountancy_bkp
    } else {
      return this.operationDetail.accountancy
    }
  }
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
    let acc = this.version == 'ORIGINAL' ? this.operationDetail.accountancy_bkp : this.operationDetail.accountancy
    return +acc.MercadoPago + +acc.cards + +acc.cash + +acc.envelopes_cash + +acc.others + +acc.expenses + +acc.vouchers
  }
  public print(template: HTMLTemplateElement) {
    this.printerService.printAngular(template)
  }
  public submitAcc(acc: object, adminPass: string) {
    this.saving = true
    console.log({ adminPass })
    console.log(acc)
    this.webService.editAccountancybyAdmin({id:this.operationDetail.operation.id_accountancy, ...acc}, adminPass)
      .then(() => {
        this.showSuccess('Rendición guardada')
        setTimeout(() => {
          this.modalService.dismissAll()
          this.getOperation()
      }, 500)
      })
      .catch((err)=>{
        this.showError(err)
      })
      .finally(()=>this.saving=false)
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

  private showPrimary(msg: string) {
    this.toastr.success('<span class="tim-icons icon-alert-circle-exc" [data-notify]="icon"></span>' + msg, '', {
      timeOut: 5000,
      enableHtml: true,
      toastClass: "alert alert-primary alert-with-icon",
      positionClass: 'toast-top-center'
    });
  }
  ngOnInit(): void {
    this.getOperation()
  }

}
