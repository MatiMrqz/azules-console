import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';
import { SidebarComponent } from 'src/app/components/sidebar/sidebar.component'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
  ]
})
export class SettingsComponent implements OnInit {
  public aliquots: AfipTypes[] = []
  public vouchers: AfipTypes[] = []
  public vouchersAllowed
  public vaTouched: boolean = false
  public company: CompanySettings
  public afip: AfipSettings
  public auto: AutoSettings
  public isLoading: boolean = true

  constructor(
    private webService: WebService,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.fetchData()
  }

  private fetchData() {
    this.isLoading = true
    Promise.all([
      this.webService.getCompanySettings().then(res => {
        this.company = res
      }),
      this.webService.getAutoInvoiceSettings().then(res => {
        this.auto = res
      }),
      this.webService.getAfipSettings().then(res => {
        this.vouchersAllowed = new Set<number>(res.EMP_ALLOWED_VTYPES.split(',').map(v => Number(v)))
        this.afip = res
      }),
      this.webService.afipTypes().then(res => {
        this.aliquots = res.ALIQUOTS
        this.vouchers = res.VOUCHERS
      })
    ]).then(() => {
      this.isLoading = false
    })
  }

  public passModal(content, formData: any, type: 'LOCAL' | 'FISCAL' | 'AUTO') {
    this.modalService.open(content)
      .result
      .then((value) => {
        if (type == 'FISCAL') {
          formData = { ...formData, EMP_ALLOWED_VTYPES: [...this.vouchersAllowed] }
        }
        this.webService.settingSetter({ payload: formData, pass: value, type })
          .then(res => {
            this.showSuccess('Datos actualizados correctamente')
            if (type == 'LOCAL') {
              SidebarComponent.setLocal(formData.LOCAL_NAME, formData.LOCAL_ADDRESS, formData.COMPANY_MAIL)
            }
            this.fetchData()
          })
          .catch(err => {
            this.showError('Ocurrió un error:' + err)
          })
      })
      .catch(err => {
        console.debug(err)
      })
  }

  setVoucher(target: EventTarget, id: number) {
    const checked = (<HTMLInputElement>target).checked
    if (checked) {
      this.vouchersAllowed.add(id)
    } else {
      this.vouchersAllowed.delete(id)
    }
    this.vaTouched = true
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

}
