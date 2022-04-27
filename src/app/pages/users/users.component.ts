import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styles: [
  ]
})
export class UsersComponent implements OnInit {
  @ViewChild('newPass') newPass;
  @Input() pin: string;
  constructor(
    private webService: WebService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  public users = []
  public helpers = []
  public turns = []
  public isLoading: boolean = true
  public searchString: string = ''
  public helpersSearch: string = ''
  public validated: boolean = false
  public user;

  ngOnInit(): void {
    this.getAll()
  }

  private getAll() {
    this.isLoading = true
    Promise.all([
      this.updateUsers(),
      this.updateHelpers(),
      this.updateTurns()
    ]).then(() => {
      this.isLoading = false
    })
  }

  private async updateUsers() {
    this.users = await this.webService.getUsers()
  }
  private async updateHelpers() {
    this.helpers = await this.webService.getHelpers()
  }
  private async updateTurns() {
    const tempTurns = await this.webService.getTurns()
    this.turns = tempTurns.map(e => {
      return { editing: false, newName: e.name, ...e }
    })
  }
  public turnModal(content){
    const modalRef = this.modalService.open(content, {
      container: 'app-users'
    })
    modalRef.result.then(
      (closed: string) => {
        console.debug(closed)
        // this.webService.newUser(this.user)
        //   .then(() => {
        //     this.showSuccess('Usuario añadido')
        //     modalRef.close()
        //     this.getAll()
        //     this.setPass(this.user.pass)
        //   })
      },
      ()=>{}
    )
  }
  public newTurn(newNameInput: HTMLInputElement, newScheduleInput: HTMLInputElement) {
    const name = newNameInput.value
    const schedule = newScheduleInput.value
    this.webService.newTurn({ name, schedule })
      .then(res => {
        this.isLoading = true
        newNameInput.value = ''
        newScheduleInput.value = ''
        console.debug(res)
        this.updateTurns().then(() => { this.isLoading = false })
      })
  }
  public editTurn(name: string, newName: string, newSchedule?: string) {
    this.webService.editTurn({ name, newName, newSchedule })
      .then(res => {
        this.isLoading = true
        this.updateTurns().then(() => { this.isLoading = false })
      })
  }
  public deleteTurn(name: string) {
    this.webService.deleteTurn(name)
      .then(res => {
        this.isLoading = true
        this.updateTurns().then(() => { this.isLoading = false })
      })
  }

public newAdmin(content){
  const modalRef = this.modalService.open(content, {
    container: 'app-users'
  })
  modalRef.result.then(
    (closed: string) => {
      console.debug(closed)
      // this.webService.newUser(this.user)
      //   .then(() => {
      //     this.showSuccess('Usuario añadido')
      //     modalRef.close()
      //     this.getAll()
      //     this.setPass(this.user.pass)
      //   })
    },
    (err)=>{}
  )
}

  public toggleHiddenProperty(user: Employee) {
    const toggleUser = { uuid: user.uuid, hidden: !user.hidden }
    this.webService.editEmployeeData(toggleUser as Employee)
      .then(() => {
        this.showPrimary(toggleUser.hidden ? 'Usuario archivado' : 'Usuario desarchivado')
        this.getAll()
      })
      .catch((err) => {
        this.showError(err)
      })
      .finally(() => {
        this.modalService.dismissAll('Hidden toggle')
      })
  }

  public newAdminApi(mail){
    this.webService.newAdmin(mail)
    .then(res=>{
      this.showSuccess('Nuevo administrador agregado.')
    })
    .catch(err=>{
      this.showError(err)
    })
  }

  public editModal(content, user: Employee) {
    this.user = { ...user };
    const modalRef = this.modalService.open(content)
    modalRef.result.then(
      (closed: string) => {
        this.webService.editEmployeeData(this.user)
          .then(() => {
            this.showSuccess('Usuario actualizado')
            this.getAll()
          })
          .catch((err) => {
            this.showError(err)
          })
      },
      ()=>{}
    )
  }
  public newModal(content) {
    this.user = {
      uname: null,
      mail: null,
      phone: null,
      address: null,
      pass: (Math.random() * 9999).toFixed(0).padStart(4, '0')
    };
    const modalRef = this.modalService.open(content, {
      container: 'app-users'
    })
    modalRef.result.then(
      (closed: string) => {
        this.webService.newUser(this.user)
          .then(() => {
            this.showSuccess('Usuario añadido')
            modalRef.close()
            this.getAll()
            this.setPass(this.user.pass)
          })
      },
      ()=>{}
    )
  }
  public setPass(inPin: string) {
    this.pin = inPin;
    const modalRef = this.modalService.open(this.newPass, {
      keyboard: false,
      backdrop: 'static'
    })
    modalRef.result.then(
      (closed: string) => {
        console.debug(closed)
        this.modalService.dismissAll('User Stored')
      },
      ()=>{}
    )
  }
  public changePass(uuid: string) {
    const newPass = (Math.random() * 9999).toFixed(0).padStart(4, '0')
    this.webService.changeEmployeePass(uuid, newPass)
      .then(() => {
        this.setPass(newPass)
      })
      .catch(err => {
        this.showError(err)
      })
  }
  public newHelperModal(content) {
    this.user = {
      uname: null,
      mail: null,
      phone: null,
      address: null,
      pass: null
    };
    const modalRef = this.modalService.open(content, {
      container: 'app-users'
    })
    modalRef.result.then(
      (closed: string) => {
        this.webService.newHelper(this.user)
          .then(() => {
            this.showSuccess('Usuario añadido')
            modalRef.close()
            this.getAll()
          })
      },
      ()=>{}
    )
  }
  public editHelperModal(content, user: Helper) {
    this.user = { ...user };
    const modalRef = this.modalService.open(content)
    modalRef.result.then(
      (closed: string) => {
        this.webService.editHelper(this.user)
          .then(() => {
            this.showSuccess('Usuario actualizado')
            this.getAll()
          })
          .catch((err) => {
            this.showError(err)
          })
      },
      ()=>{}
    )
  }
  public toggleHiddenPropertyHelper(user: Helper) {
    const toggleUser = { uuid: user.uuid, hidden: !user.hidden }
    this.webService.editHelper(toggleUser as Employee)
      .then(() => {
        this.showPrimary(toggleUser.hidden ? 'Usuario archivado' : 'Usuario desarchivado')
        this.getAll()
      })
      .catch((err) => {
        this.showError(err)
      })
      .finally(() => {
        this.modalService.dismissAll('Hidden toggle')
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
