import { Injectable } from '@angular/core';
import EscPosEncoder from 'esc-pos-encoder';
import { fromByteArray } from 'base64-js';

@Injectable({
  providedIn: 'root'
})
export class EscposPrintService {
  private printerBaseUrl: string = 'http://localhost:3001/'

  constructor() { }

  private async getPrinterStatus() {
    return fetch(this.printerBaseUrl + 'printer/status', {
      method: 'GET'
    }).then(res => res.text())
  }
  private async sendToPrinter(data: string) {
    return fetch(this.printerBaseUrl + 'printer/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: data
    }).then(res => {
      return res.text()
    })
  }
  public async printInvoice(invoiceData: { CAE: { N: number, CAE: string, CAEFchVto: string }[], afipVoucherData: { detail: VoucherAfipData[] }, emitterData: VoucherEmitterData }, items: ItemInvoice[], payer: InvoiceClient, voucherType: AfipTypes, qrContent:string) {
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
        (acc,i)=>acc.concat(
          [
            [(enc:EscPosEncoder)=>{return enc.bold(true).text(i.description.substring(0,31)+`(${i.aliquot[0].aliquotPercent})`).bold(false)},'$'+i.subtotal.toFixed(2)],
            [(Math.round((i.quantity + Number.EPSILON) * 100) / 100).toString()+`[${i.unit}]`+' x '+'$'+i.unit_price.toString(),''],['','']
          ])
          ,[])
      )
      if(voucherType.Id==1){
        res=this.extraVoucherData(res,invoiceData.afipVoucherData.detail)
      }
      const encoded = res.line('------------------------------------------------')
      .bold(true)
      .table([
        { width: 8, align: 'right' },
        { width: 40, align: 'right' }
      ], [
        ['TOTAL', '$'+invoiceData.afipVoucherData.detail[0].ImpTotal.toString()]
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
      .qrcode(qrContent,2,7,'m')
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('full')
      .encode()//Añadir mas
    const b64Data = fromByteArray(encoded)
    const printerReady = await this.getPrinterStatus()
    if (printerReady != 'open') throw 'Printer connection closed'
    return await this.sendToPrinter(b64Data)
  }

  private extraVoucherData(encoder:EscPosEncoder,vData:VoucherAfipData[]):EscPosEncoder{
    return encoder
    .line('------------------------------------------------').table([
      { width: 32, align: 'left' },
      { width: 15, align: 'right' }
    ], [
      ['Total Neto', '$'+ vData[0].ImpNeto.toString()],
      ['IVA','$'+vData[0].ImpIVA.toString()],
      ['Impuestos No Gravados','$'+vData[0].ImpTotConc.toString()],
      ['Exento','$'+vData[0].ImpOpEx.toString()]
    ])
  }

  public afipQRDataFormatter(invoiceData: { CAE: { N: number, CAE: string, CAEFchVto: string }[], afipVoucherData: { detail: VoucherAfipData[] }, emitterData: VoucherEmitterData }, voucher: AfipTypes) {
    const d = new Date()

    const data = (JSON.stringify(
      {
        ver: 1,
        fecha: d.toISOString().slice(0, 10),
        cuit: +invoiceData.emitterData.legals.cuit.replace(/\-|\./g,''),
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
    const b64qr=window.btoa(decodeURIComponent(encodeURIComponent(data))) 
    return 'https://www.afip.gob.ar/fe/qr/?p='+b64qr
  }
  public async urlShortener(url: string):Promise<string> {
    return fetch('https://azulessa.com/yourls/yourls-api.php', {
      method: 'POST',
      mode:'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body:`username=admin&password=frulov3.0&action=shorturl&url=${url}&format=json`
    })
    .then((res:Response)=>{return res.json()})
    .then((res:any)=>{
      if(res.status!='success') throw 'Shortener Error'
      return res.shorturl
    })
  }
}
