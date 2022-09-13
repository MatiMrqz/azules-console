import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-new-credit-note',
  templateUrl: './new-credit-note.component.html',
  styles: [
  ]
})
export class NewCreditNoteComponent implements OnInit {

  @Input() invoice_ref: { n: number, type: number }
  public inv: InvoiceRecord
  public showClient: boolean = true
  public types: {
    documents: AfipTypes[],
    vouchers: AfipTypes[],
    aliquot: number
  }
  public taxes: number = 0;
  public total: number = 0;
  public saving: boolean = false;
  public errorMsg: string | null = null;
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
      console.log(this.types)
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
  totalCalc(formVals: any) {
    var tempVals = { ...formVals, total: 0 }
    this.total = 0
    formVals.amount_taxes = formVals.amount_net * this.types.aliquot
    this.taxes = formVals.amount_taxes
    Object.values(tempVals).forEach(v => {
      this.total += +v
    })
  }
  async submit(formVals: any) {
    this.saving = true
    const payload = {
      detail: formVals,
      client: {
        n: this.inv.invoice_client_n,
        identifier: this.inv.identifier,
        id_type: this.inv.id_type,
        user_name: this.inv.user_name,
        business_name: this.inv.business_name,
        tax_address: this.inv.tax_address,
        person: this.inv.person,
        phone: this.inv.phone,
        email: this.inv.email
      },
      ref: {
        n: this.inv.n,
        type: this.types.vouchers.find(v => v.Id == this.inv.voucher_type)
      }
    }
    console.log(payload)
    this.webService.newCreditNote(payload)
      .then(res => {
        this.activeModal.close(res)
      })
      .catch(err => {
        this.errorMsg = err
        this.saving = false
      })
  }
}
