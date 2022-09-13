import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'modal-invoice-detail',
  templateUrl: './invoice-detail.html',
  styles: [
  ]
})
export class InvoiceDetailComponent implements OnInit {

  @Input() invoice_ref: { n: number, type: number }
  public inv: InvoiceRecord
  public showClient: boolean = true
  public types: {
    documents: AfipTypes[],
    vouchers: AfipTypes[],
    aliquot: number
  }
  constructor(
    public activeModal: NgbActiveModal,
    public webService: WebService
  ) { }

  ngOnInit(): void {
    this.webService.invoiceInitPoint().then(data => {
      this.types = {
        documents: data.DOCUMENTS,
        vouchers: data.VOUCHERS,
        aliquot: (+data.ALIQUOT.Desc.split('%')[0]) / 100
      }
    })
      .then(() => {
        this.webService.getInvoiceDetail(this.invoice_ref.n, this.invoice_ref.type)
          .then(i => {
            this.inv = i
          })
      })
  }

  getVoucherDesc(id: number) {
    return this.types.vouchers.find(v => v.Id == id).Desc
  }
  getDocumentDesc(id: number) {
    return this.types.documents.find(d => d.Id == id).Desc
  }
 
}
