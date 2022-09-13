import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, debounceTime, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { InvoiceDetailComponent } from 'src/app/modals/invoice-detail/invoice-detail';
import { NewCreditNoteComponent } from 'src/app/modals/new-credit-note/new-credit-note.component';
import { NewInvoiceComponent } from 'src/app/modals/new-invoice/new-invoice.component';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styles: [`
  .dp-hidden {
    width: 0;
    margin: 0;
    border: none;
    padding: 0;
  }
  .custom-day {
    text-align: center;
    padding: 0.185rem 0.25rem;
    display: inline-block;
    height: 2rem;
    width: 2rem;
  }
  .custom-day.focused {
    background-color: #e6e6e6;
  }
  .custom-day.range, .custom-day:hover {
    background-color: rgb(2, 117, 216);
    color: white;
  }
  .custom-day.faded {
    background-color: rgba(2, 117, 216, 0.5);
  }
`]
})
export class InvoicesComponent implements OnInit {
  public voucherTypes: InvoiceVoucherTypes[]
  public _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  public _invoices$ = new BehaviorSubject<InvoiceRecord[]>([]);
  public _collectionSize$ = new BehaviorSubject<number>(0);
  private invoicesFetch: InvoiceRecord[]
  public searchTerm: string = ''
  public invoicesSummbyVoucher: any = []
  public invoicesSummbyType: any = []

  public page = 1;
  public pageSize = 10;

  public radioDef = '1M';
  public filter = {
    auto: true,
    manual: true
  }

  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public hoveredDate: NgbDate | null = null;

  constructor(
    private modalService: NgbModal,
    private webService: WebService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter
  ) {
    this.fromDate = calendar.getPrev(calendar.getToday(), 'm', 1)
    this.toDate = calendar.getNext(calendar.getToday());
    this.getSummarybyVoucher(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
    this.getSummarybyType(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))

    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._invoices$.next(result.invoices)
      this._collectionSize$.next(result.size)
    })
  }

  public async getData(period?: "1M" | "1Y" | "5Y") {
    this.invoicesFetch = await this.webService.getInvoicesRecord(period)
    this.refreshTable()
  }

  public async getSummarybyVoucher(from: string, to?: string) {
    this.invoicesSummbyVoucher = await this.webService.getInvoicesSummarybyVoucher({ from, to })
    this.invoicesSummbyVoucher.push(this.invoicesSummbyVoucher.reduce((acc, i) => acc = { amount: +acc.amount + +i.amount, N: +acc.N + +i.N, taxes: +acc.taxes + +i.taxes, voucher_type: 0 }, { amount: 0, N: 0, taxes: 0, voucher_type: 0 }))
    console.log(this.invoicesSummbyVoucher)
  }
  public async getSummarybyType(from: string, to?: string) {
    this.invoicesSummbyType = await this.webService.getInvoicesSummarybyType({ from, to })
    this.invoicesSummbyType.push(this.invoicesSummbyType.reduce((acc, i) => acc = { ...acc, net: +acc.net + +i.net, taxes: +acc.taxes + +i.taxes, exent: +acc.exent + +i.exent, untaxed: +acc.untaxed + +i.untaxed, itc: +acc.itc + +i.itc, total: +acc.total + +i.total }, { type: 'TOTAL', net: 0, taxes: 0, exent: 0, untaxed: 0, itc: 0, total: 0 }))
    console.log(this.invoicesSummbyType)
  }

  public refreshTable() {
    this._search$.next()
  }

  private _search(): Observable<{ invoices: InvoiceRecord[], size: number }> {

    let invoices = this.invoicesFetch
    invoices = invoices.filter(inv => (inv.performed_by_mode == "MANUAL" && this.filter.manual) || (inv.performed_by_mode == "AUTO" && this.filter.auto))
    invoices = invoices.filter(inv => this.matches(inv, this.searchTerm))

    const size = invoices.length

    invoices = invoices.slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)

    return of({ invoices, size })
  }

  private matches(invoice: InvoiceRecord, term: string) {
    term = term.toLowerCase()
    return invoice.n.toString().includes(term)
      || invoice.amount.toString().includes(term)
      || invoice.business_name?.toLowerCase().includes(term)
      || invoice.user_name?.toLowerCase().includes(term)
      || invoice.CAE.toString().includes(term)
      || invoice.identifier.toString().includes(term)
  }

  public getVTDesc(id: number) {
    if (!this.voucherTypes) return 'ERR'
    return this.voucherTypes.find(vt => vt.Id == id).Desc
  }

  public newInvoice() {
    const modalRef = this.modalService.open(NewInvoiceComponent,
      {
        container: 'app-invoices',
        backdrop: 'static',
        size: 'xl'
      })
    modalRef.result.then(
      (closed: string) => {
        console.debug(`Closed reason: ${closed}`)
      },
      () => { }
    )
      .finally(() => {
        this.getData()
      })
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
      this.getSummarybyVoucher(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
      this.getSummarybyType(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  ngOnInit(): void {
    this.webService.getVoucherTypes().then(
      vt => {
        this.voucherTypes = vt
      })
      .finally(() => {
        this.getData()
      })
  }

  public newCreditNote(n:number,type:number) {
    const modalRef = this.modalService.open(NewCreditNoteComponent,
      {
        container: 'app-invoices',
        backdrop: 'static',
        size: 'xl'
      })
    modalRef.componentInstance.invoice_ref={
      n,type
    }
    modalRef.result.then(
      (closed: string) => {
        console.debug(`Closed reason: ${closed}`)
      },
      () => { }
    )
      .finally(() => {
        this.getData()
      })
  }

  public invoiceDetail(n:number,type:number) {
    const modalRef = this.modalService.open(InvoiceDetailComponent,
      {
        container: 'app-invoices',
        size: 'xl'
      })
    modalRef.componentInstance.invoice_ref={
      n,type
    }
  }

}
