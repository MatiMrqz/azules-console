import { Injectable } from '@angular/core';
import EscPosEncoder from 'enjox-esc-pos-encoder';
import { fromByteArray } from 'base64-js';

interface EditedProducts extends Products { items_sold: number, items_replacement: number, end_stock: number, validated: boolean }
interface EditedPumps extends Pumps { venting: number, meter_end: number, meter_diff: string, validated: boolean, reset_meter: boolean, }

@Injectable({
  providedIn: 'root'
})
export class EscposPrintService {
  private printerBaseUrl: string
  private printerName: string

  constructor() {
    console.debug('Esc/Pos printer service loading...')
    this.printerBaseUrl = localStorage.getItem('EscPosPrinterIP')
    this.printerName = localStorage.getItem('EscPosPrinterName')

  }

  private async sendToPrinter(data: string, id: string): Promise<{ success: boolean, data: string }> {
    if(!this.printerName||!this.printerBaseUrl) throw 'Configuración de impresora incorrecta. Revise IP y Nombre de impresora en configuración.'
    return fetch(this.printerBaseUrl + '/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        printer: this.printerName,
        id,
        data
      })
    }).then(res => {
      return res.json()
    })
  }
  public async printShiftSummary(opId: number, turn: { name: string, schedule: string }, employee: { uname: string, uuid: string }, helper: { uname: string, uuid: string } | null, emitter: VoucherEmitterData, products: Array<EditedProducts>, accountancy: { cash: number, envelopes_cash: number, n_envelopes: number, cards: number, vouchers: number, MercadoPago: number, expenses: number, others: number }, acc: { accountancy: number, products: number, posop: number }, invoices: string, obs?: string) {
    const d = new Date()
    var enc = new EscPosEncoder({ codepageMapping: 'star' })
      .initialize()
      .align('center')
      .bold(true)
      .width(2)
      .height(2)
      .line('Cierre de Turno')
      .bold(false)
      .width(1)
      .height(1)
      .newline()
      .align('left')
      .table([
        { width: 24, align: 'left' },
        { width: 24, align: 'right' }
      ], [
        [d.toLocaleString(), (enc) => { return enc.text('N:').bold(true).text(opId.toString()).bold(false) }],
      ])
      .line('Turno:' + turn.name)
      .line('Enc:' + employee.uname.substring(0, 24))
      .size('small')
      .line('EncId:' + employee.uuid)
      .size('normal')
      .line('Ayud:' + (helper ? (helper.uname.substring(0, 24)) : '-'))
      .line('------------------------------------------------')
      .align('center')
      .bold(true)
      .line('SUCURSAL')
      .bold(false)
      .align('left')
      .line(emitter.local.name)
      .line(emitter.local.address)
      .line('CUIT:' + emitter.legals.cuit)
      .line('------------------------------------------------')
      .align('center')
      .bold(true)
      .line('CONTROL DE STOCK - Productos')
      .bold(false)
      .table([
        { width: 24, align: 'left' },
        { width: 8, align: 'right' },
        { width: 8, align: 'right' },
        { width: 8, align: 'right' }
      ], [
        ['Nombre', 'Inicial', 'Recarga', 'Final'],
        ...products.filter(p => p.hidden == false).map(pr => [pr.name.substring(0, 24), `${pr.stock}[u.]`, `${pr.items_replacement}[u.]`, `${pr.end_stock}[u.]`])
      ])
      .line('------------------------------------------------')
      .align('center')
      .bold(true)
      .line('VENTAS REALIZADAS')
      .bold(false)
      .align('left')
      .table([
        { width: 15, align: 'left' },
        { width: 11, align: 'right' },
        { width: 11, align: 'right' },
        { width: 11, align: 'right' }
      ], [
        ['Item', 'U.Vend.', 'P.Unit.', 'Subtotal'],
        ...products.filter(p => (p.hidden == false && p.items_sold > 0 && p.validated)).map(p => { return [p.name.substring(0, 15), `${p.items_sold}[u.]`, '$' + p.unit_price, `$${(p.unit_price * p.items_sold).toFixed(2)}`] })
      ])
      .table([
        { width: 24, align: 'left' },
        { width: 24, align: 'right' }
      ],
        [
          [(enc) => { return enc.bold(true).text('TOTAL') }, (enc) => { return enc.bold(true).text(`$${Math.round((acc.products + acc.posop) * 100) / 100}`).bold(false) }]
        ]
      )
      .line('------------------------------------------------')
      .align('center')
      .bold(true)
      .line('RENDICION')
      .bold(false)
      .align('left')
      .table([
        { width: 24, align: 'left' },
        { width: 24, align: 'left' }
      ], [
        [`Sobres:${accountancy.n_envelopes}/$${accountancy.envelopes_cash}`, `Efectivo:$${accountancy.MercadoPago}`],
        [`Tarjetas:$${accountancy.cards}`, `Mer.Pago:$${accountancy.MercadoPago}`],
        [`Vales:$${accountancy.vouchers}`, `Gastos:$${accountancy.expenses}`],
        [`Otros:$${accountancy.others}`, ''],
      ])
      .table([
        { width: 10, align: 'right' },
        { width: 38, align: 'right' }
      ],
        [
          [(enc) => { return enc.bold(true).text('TOTAL') }, (enc) => { return enc.bold(true).text(`$${acc.accountancy}`).bold(false) }]
        ]
      )
      .line('------------------------------------------------')
      .align('center')
      .bold(true)
      .line('RESULTADO DEL TURNO')
      .line(`$${Math.round((acc.accountancy - (acc.products + acc.posop)) * 100) / 100}`)
      .bold(false)
      .size('small')
      .line(acc.accountancy - (acc.products + acc.posop) < 0 ? 'Deuda' : 'A favor')
      .size('normal')
      .align('left')
      .line('------------------------------------------------')
      .align('center')
      .bold(true)
      .line('FACTURACION')
      .bold(false)
      .align('left')
      .line('Nros de facturas efectuadas durante el turno: ' + invoices, 48)
      .line('------------------------------------------------')
      .line('Observaciones:' + obs ?? '-')
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .align('center')
      .line('----------------------------')
      .size('small')
      .line('Firma de encargado')
      .size('normal')
      .align('left')
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('full')
      .encode()
    const b64Data = fromByteArray(enc)
    return await this.sendToPrinter(b64Data, 'TURNO_' + opId)
  }
  public async printInvoice(invoiceData: { CAE: { N: number, CAE: string, CAEFchVto: string }[], afipVoucherData: { detail: VoucherAfipData[] }, emitterData: VoucherEmitterData }, items: ItemInvoice[], payer: InvoiceClient, voucherType: AfipTypes, qrContent: string) {
    const d = new Date()
    var res = new EscPosEncoder({ codepageMapping: 'star' })
      .initialize()
      .align('center')
      .bold(true)
      .line(invoiceData.emitterData.company.name)
      .bold(false)
      .newline()
      .align('left')
      .line(invoiceData.emitterData.local.name)
      .line(invoiceData.emitterData.local.address)
      .line('CUIT:' + invoiceData.emitterData.legals.cuit)
      .line('IIBB:' + invoiceData.emitterData.legals.iibb)
      .line(invoiceData.emitterData.legals.condition)
      .line('------------------------------------------------')
      // .rule({style:'double'})
      .align('center')
      .bold(true)
      .width(2)
      .height(2)
      .line(voucherType.Desc)
      .newline()
      .align('left')
      .bold(false)
      .width(1)
      .height(1)
      .table([
        { width: 24, align: 'left' },
        { width: 24, align: 'right' }
      ], [
        ['Fecha:' + d.toLocaleDateString(), 'N:' + invoiceData.emitterData.legals.salesPoint.padStart(3, '0') + '-' + invoiceData.CAE[0].N.toString().padStart(18, '0')],
        [(enc) => { return enc.text('Vend:' + invoiceData.emitterData.seller.name) }, '']
      ])
      .line('------------------------------------------------')
      .line('Clie.:' + (!!payer.user_name ? payer.user_name! : '-'))
      .line('R.Soc.:' + (!!payer.business_name ? payer.business_name! : '-'))
      .line('CUIT/DNI:' + payer.identifier)
      .table([
        { width: 24, align: 'left' },
        { width: 24, align: 'left' }
      ], [
        ['Email:' + (payer.email ? payer.email : '-'), 'Tel.:' + (payer.phone || '-')],
      ])
      .line('Dir.:' + payer.tax_address)
      .line('------------------------------------------------')
      .table([
        { width: 36, align: 'left' },
        { width: 11, align: 'right' }
      ],
        items.reduce(
          (acc, i) => acc.concat(
            [
              [(enc: EscPosEncoder) => { return enc.bold(true).text(i.description.substring(0, 31) + `(${i.aliquot[0].aliquotPercent})`).bold(false) }, '$' + i.subtotal.toFixed(2)],
              [(Math.round((i.quantity + Number.EPSILON) * 100) / 100).toString() + `[${i.unit}]` + ' x ' + '$' + i.unit_price.toString(), ''], ['', '']
            ])
          , [])
      )
    if (voucherType.Id == 1) {
      res = this.extraVoucherData(res, invoiceData.afipVoucherData.detail)
    }
    const encoded = res.line('------------------------------------------------')
      .bold(true)
      .table([
        { width: 8, align: 'right' },
        { width: 40, align: 'right' }
      ], [
        ['TOTAL', '$' + invoiceData.afipVoucherData.detail[0].ImpTotal.toString()]
      ])
      .bold(false)
      .align('center')
      .line('------------------------------------------------')
      .line('Factura Electronica')
      .table([
        { width: 24, align: 'left' },
        { width: 24, align: 'right' }
      ], [
        ['CAE:' + invoiceData.CAE[0].CAE, 'F.Vto:' + invoiceData.CAE[0].CAEFchVto],
      ])
      .qrcode(qrContent, 2, 7, 'm')
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('full')
      .encode()//Añadir mas
    const b64Data = fromByteArray(encoded)
    return await this.sendToPrinter(b64Data, 'FACTURA_' + invoiceData.CAE[0].N.toString())
  }

  private extraVoucherData(encoder: EscPosEncoder, vData: VoucherAfipData[]): EscPosEncoder {
    return encoder
      .line('------------------------------------------------').table([
        { width: 32, align: 'left' },
        { width: 15, align: 'right' }
      ], [
        ['Total Neto', '$' + vData[0].ImpNeto.toString()],
        ['IVA', '$' + vData[0].ImpIVA.toString()],
        ['Impuestos No Gravados', '$' + vData[0].ImpTotConc.toString()],
        ['Exento', '$' + vData[0].ImpOpEx.toString()]
      ])
  }

  public afipQRDataFormatter(invoiceData: { CAE: { N: number, CAE: string, CAEFchVto: string }[], afipVoucherData: { detail: VoucherAfipData[] }, emitterData: VoucherEmitterData }, voucher: AfipTypes) {
    const d = new Date()

    const data = (JSON.stringify(
      {
        ver: 1,
        fecha: d.toISOString().slice(0, 10),
        cuit: +invoiceData.emitterData.legals.cuit.replace(/\-|\./g, ''),
        ptoVta: +invoiceData.emitterData.legals.salesPoint,
        tipoCmp: voucher.Id,
        nroCmp: +invoiceData.CAE[0].N,
        importe: invoiceData.afipVoucherData.detail[0].ImpTotal,
        moneda: invoiceData.afipVoucherData.detail[0].MonId,
        ctz: invoiceData.afipVoucherData.detail[0].MonCotiz,
        tipoDocRec: invoiceData.afipVoucherData.detail[0].DocTipo,
        nroDocRec: invoiceData.afipVoucherData.detail[0].DocNro,
        tipoCodAut: "E",
        codAut: +invoiceData.CAE[0].CAE
      }
    ))
    const b64qr = window.btoa(decodeURIComponent(encodeURIComponent(data)))
    return 'https://www.afip.gob.ar/fe/qr/?p=' + b64qr
  }
  public async urlShortener(url: string): Promise<string> {
    return fetch('https://azulessa.com/yourls/yourls-api.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: `username=admin&password=frulov3.0&action=shorturl&url=${url}&format=json`
    })
      .then((res: Response) => { return res.json() })
      .then((res: any) => {
        if (res.status != 'success') throw 'Shortener Error'
        return res.shorturl
      })
  }
  public setNewPrinterIp(ip: string, name: string) {
    localStorage.setItem('EscPosPrinterIP', ip)
    this.printerBaseUrl = ip
    localStorage.setItem('EscPosPrinterName', name)
    this.printerName = name
  }
}
