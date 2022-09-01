import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { catchError, debounceTime, defer, distinctUntilChanged, filter, map, merge, Observable, of, OperatorFunction, Subject, Subscription, switchMap, tap } from 'rxjs';
import { EscposPrintService } from 'src/app/services/escpos-print.service';
import { WebService } from 'src/app/services/web.service';

interface ProductItem {
  name: string,
  unit_price: string | number,
  unit: string,
  type: StockTypes,
  itc?: number
}

@Component({
  selector: 'app-new-invoice',
  templateUrl: './new-invoice.component.html',
  styles: [
  ]
})
export class NewInvoiceComponent implements OnInit {

  @Input() employee?: Partial<Employee>

  public isCollapsed: boolean = true
  clientForm = this.fb.group({
    voucher_type: [null, Validators.required],
    user_name: [''],
    business_name: [''],
    identifier: [0, Validators.required],
    id_type: [0, Validators.required],
    person: ['', Validators.required],
    email: ['', Validators.email],
    tax_address: ['', Validators.required],
    phone: ['']
  })

  newItemForm = this.fb.group({
    quantity: [null, Validators.required],
    subtotal: [null, Validators.required]
  })

  ipEscPos: string = ""
  nameEscPos: string = ""

  public items: ItemInvoice[] = []
  public products: ProductItem[] = []
  public pSelected: ProductItem | null = null
  private subscriptions: Subscription
  public totals: { amount: number, n: number } = { amount: 0, n: 0 }

  public submitting: boolean = false

  public messages: { status: boolean | null, p: string, extra?: string }[] = []

  private preventStorage: any = {}

  model: InvoiceClient
  searching: boolean = false
  searchFailed: boolean = false
  voucherTypes: AfipTypes[]
  documentTypes: AfipTypes[]
  aliquot: AfipTypes


  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();


  constructor(
    private webService: WebService,
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private printer: EscposPrintService,
    private el: ElementRef
  ) {
    this.newItemForm.disable()

    this.webService.invoiceInitPoint().then(data => {
      this.documentTypes = data.DOCUMENTS
      this.voucherTypes = data.VOUCHERS
      this.aliquot = data.ALIQUOT
      this.updateForm(data.DEFAULT_CLIENT)
    })
    this.webService.getAllProductsAutoHdr().then(
      p => {
        this.products = p.filter(p => p.hidden == false).map(prod => {
          return { name: prod.name, unit_price: prod.unit_price, unit: 'u.', type: 'PRODUCT' }
        })
      })
      .then(() => {
        this.webService.getAllPumpsAutoHdr().then(p => {
          var pumps = p.map<ProductItem>(pu => {
            return { name: pu.description ?? ('Surtidor ' + pu.id), unit_price: pu.unit_price, unit: pu.unit, itc: +pu.itc, type: "PUMP" }
          })
          this.products = [...pumps, ...this.products]
        })
      })
    this.clientForm.controls['voucher_type'].valueChanges.subscribe(value => {
      if (value == '-' || !value) {
        this.clientForm.controls['user_name'].disable()
        this.clientForm.controls['business_name'].disable()
        this.clientForm.controls['identifier'].disable()
        this.clientForm.controls['id_type'].disable()
        this.clientForm.controls['person'].disable()
        this.clientForm.controls['email'].disable()
        this.clientForm.controls['tax_address'].disable()
        this.clientForm.controls['phone'].disable()
      } else {
        this.clientForm.controls['user_name'].enable()
        this.clientForm.controls['business_name'].enable()
        this.clientForm.controls['identifier'].enable()
        this.clientForm.controls['id_type'].enable()
        this.clientForm.controls['person'].enable()
        this.clientForm.controls['email'].enable()
        this.clientForm.controls['tax_address'].enable()
        this.clientForm.controls['phone'].enable()
      }
    })
  }

  search$(term: string): Observable<InvoiceClient[]> {
    if (term === '') {
      return of([]);
    }
    return defer(() => this.webService.findClientByName(term))
  }

  search: OperatorFunction<string, readonly InvoiceClient[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.search$(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([])
          }))
      ),
      tap(() => this.searching = false)
    )

  formatter = (result: InvoiceClient) => result.business_name || result.user_name

  pSearch: OperatorFunction<string, readonly ProductItem[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged())
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()))
    const inputFocus$ = this.focus$
    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.products : this.products.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    )
  }
  pFormatter = (result: ProductItem) => result.name

  updateForm(data: InvoiceClient) {
    this.clientForm.patchValue({
      voucher_type: data.voucher_preference ?? '',
      user_name: data.user_name,
      business_name: data.business_name,
      identifier: data.identifier,
      id_type: data.id_type ?? '',
      tax_address: data.tax_address,
      phone: data.phone,
      email: data.email,
      person: data.person ?? ''
    })
    this.model = data
  }

  getClientbyID() {
    const id = (this.clientForm.get('identifier') as FormControl).value
    const vType = (this.clientForm.get('voucher_type') as FormControl).value

    const formData = this.clientForm.value as InvoiceClient
    if (!id) return
    this.webService.getClientById(id).then(
      data => {
        this.updateForm({ ...formData, ...data, identifier: id, voucher_preference: vType })
      }
    ).catch(
      err => { console.error('Error fetching data:' + err) }
    )
  }

  addItem() {
    if (!this.newItemForm.valid) return
    const itc = this.pSelected.itc ? [{ aliquotType: 9999, aliquotUnitAmount: this.pSelected.itc, aliquotPercent: '0%' }] : []
    this.items.push({
      description: this.pSelected.name,
      quantity: this.newItemForm.get('quantity').value,
      unit_price: +this.pSelected.unit_price,
      unit: this.pSelected.unit ?? '',
      net_unit_price: (+this.pSelected.unit_price - (this.pSelected.itc ?? 0)) / (1 + (parseFloat((this.aliquot.Desc as string).split('%')[0]) / 100)),
      // discountPercent: this.aliquot.Desc == "0%" ? "0%" : ((1 - (1 / (1 + (parseFloat((this.aliquot.Desc as string).split('%')[0]) / 100)))) * 100).toString() + "%",
      aliquot: [{
        aliquotType: this.aliquot.Id,
        aliquotPercent: this.aliquot.Desc,
      }, ...itc],
      type: this.pSelected.type,
      subtotal: this.newItemForm.get('subtotal').value
    })
    this.totals = { amount: (this.totals.amount + this.newItemForm.get('subtotal').value), n: this.totals.n + 1 }
    this.subscriptions.unsubscribe()
    this.pSelected = null
    this.newItemForm.reset()
    this.newItemForm.disable()
  }

  removeItem(index: number) {
    this.totals = { amount: (this.totals.amount - this.items[index].subtotal), n: this.totals.n - 1 }
    this.items.splice(index, 1)
  }

  pInputEvent(itemSelected: ProductItem) {
    if (itemSelected.type == "PRODUCT") {
      this.subChanges(itemSelected)
      this.newItemForm.enable()
      this.newItemForm.get('quantity').setValue(1)
      this.newItemForm.get('subtotal').disable()
      const quantity = this.el.nativeElement.querySelector('[formcontrolname="quantity"]');
      quantity.focus();
    } else if (itemSelected.type == "PUMP") {
      this.subChanges(itemSelected)
      this.newItemForm.enable()
      this.newItemForm.get('quantity').disable()
      const subtotal = this.el.nativeElement.querySelector('[formcontrolname="subtotal"]');
      subtotal.focus();
    } else {
      this.newItemForm.reset()
      this.newItemForm.disable()
    }
  }

  submitInvoice() {
    if (this.clientForm.invalid || this.items.length == 0) {
      return
    }
    this.submitting = true
    const payload = {
      payer: this.clientForm.value,
      voucher: { type: this.clientForm.get('voucher_type').value },
      items: this.items
    }
    delete payload.payer.voucher_type
    this.messages = []
    this.messages.push({ status: null, p: 'Registrando Factura...' })
    if (this.employee) {
      this.webService.submitInvoiceEmployee(
        {
          employee: this.employee!,
          ...payload
        })
        .then(res => {
          this.ticketGenAndSend(res, payload)
        })
        .catch(err3 => {
          this.messages.pop()
          this.messages.push({ status: false, p: err3 })
          this.submitting = false
        })
    } else {
      this.webService.submitInvoiceAdmin(payload)
        .then(res => {
          this.ticketGenAndSend(res, payload)
        })
        .catch(err3 => {
          this.messages.pop()
          this.messages.push({ status: false, p: err3 })
          this.submitting = false
        })
    }
  }

  private ticketGenAndSend(data: any, payload: any) {
    this.messages[this.messages.length - 1].status = true
    this.messages.push({ status: null, p: 'Generando ticket...' })
    const voucher = this.voucherTypes.find(v => v.Id == payload.voucher.type)
    this.printer.urlShortener(this.printer.afipQRDataFormatter(data, voucher))
      .then(qrContent => {
        this.messages[this.messages.length - 1].status = true
        this.messages.push({ status: null, p: 'Imprimiendo...' })
        this.printer.printInvoice(data, payload.items, payload.payer, voucher, qrContent).then((res) => {
          if(res.success){
            this.messages[this.messages.length - 1].status = true
            this.activeModal.close(data)
            this.submitting = false
          }else{
            this.messages.pop()
            this.messages.push({ status: false, p: res.data, extra: 'PRINT' })
            this.preventStorage = { data, payload, voucher, qrContent }
            console.error(res.data)
          }
        }).catch(err => {
          this.messages.pop()
          this.messages.push({ status: false, p: err, extra: 'PRINT' })
          this.preventStorage = { data, payload, voucher, qrContent }
          console.error(err)
        })
      })
      .catch(err2 => {
        this.messages.pop()
        this.messages.push({ status: false, p: err2, extra: 'QR' })
        this.preventStorage = { data, payload }
      })
  }

  private subChanges(itemSelected: ProductItem) {
    if (this.subscriptions != undefined || this.subscriptions != null) this.subscriptions.unsubscribe()
    const unit_price = +itemSelected.unit_price
    if (itemSelected.type == "PRODUCT") {
      this.subscriptions = this.newItemForm.controls['quantity'].valueChanges.subscribe(
        v => {
          this.newItemForm.controls['subtotal'].setValue(v * unit_price)
        }
      )
    } else {
      this.subscriptions = this.newItemForm.controls['subtotal'].valueChanges.subscribe(
        s => {
          this.newItemForm.controls['quantity'].setValue(s / unit_price)
        }
      )
    }
  }

  retry(type: 'QR' | 'PRINT') {
    if (type == 'PRINT') {
      this.printer.printInvoice(this.preventStorage.data, this.preventStorage.payload.items, this.preventStorage.payload.payer, this.preventStorage.voucher, this.preventStorage.qrContent).then(() => {
        this.messages[this.messages.length - 1].status = true
        this.activeModal.close(this.preventStorage.data)
        this.submitting = false
      }).catch(err => {
        this.messages.pop()
        this.messages.push({ status: false, p: err, extra: 'PRINT' })
      })
    }
    if (type == 'QR') {
      this.ticketGenAndSend(this.preventStorage.data, this.preventStorage.payload)
    }
  }

  editSettings(data: any) {
    this.printer.setNewPrinterIp(data.printerAddress, data.printerName)
  }

  ngOnInit(): void {
    this.ipEscPos = localStorage.getItem('EscPosPrinterIP') ?? ''
    this.nameEscPos = localStorage.getItem('EscPosPrinterName') ?? ''
    this.instance.selectItem.subscribe(event$ => {
      this.pInputEvent(event$.item)
    })
  }
}
