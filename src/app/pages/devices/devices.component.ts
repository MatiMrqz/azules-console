import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styles: [
  ]
})
export class DevicesComponent implements OnInit {

  constructor(
    private webService: WebService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  public devices: any[];
  public isLoading: boolean = true;
  public qrContent: string = '';

  public async updateDevices() {
    this.isLoading = true
    this.devices = await this.webService.getDevices()
    this.isLoading = false
    // console.debug(this.devices)
  }

  ngOnInit(): void {
    this.updateDevices()
  }

  public setAliasModal(content, selectedDevice) {
    this.modalService.open(content).result
      .then(alias => {
        this.webService.setDeviceAlias(selectedDevice['uuid'], alias).then(() => {
          this.showSuccess('Alias establecido')
          this.updateDevices()
        })
          .catch(() => {
            this.showError('Ocurrio un error. Intente nuevamente')
          })
      })
      .catch(err => {
        console.debug(err)
      })
  }

  public async newDeviceModal(content) {
    this.webService.generateAuthorization()
      .then((res) => {
        console.log(`${environment.fBaseUrl}#/auth/device/${res.authToken}`)
        this.qrContent = encodeURIComponent(`${environment.fBaseUrl}#/auth/device/${res.authToken}`)
        console.debug({ next: this.qrContent })
      })
      .then(() => {
        this.modalService.open(content).result
          .then(() => {
            this.updateDevices()
          })
          .catch(
            () => { }
          )
      })
      .catch((err) => {
        this.showError(err);
      })
  }

  public eliminaModal(content, uuid) {
    this.modalService.open(content)
      .result
      .then(() => {
        this.webService.deleteDevice(uuid).then(() => {
          this.showPrimary('Autorización de dispositivo revocada')
          this.updateDevices()
        })
      })
      .catch(err => {
        console.debug(err)
      })
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

}
