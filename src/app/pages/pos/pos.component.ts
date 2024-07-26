import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NewCategoryComponent } from 'src/app/modals/categories/new/new_category.component';
import { EditTypeComponent } from 'src/app/modals/pump_types/edit/edit_type.component';
import { WebService } from 'src/app/services/web.service';
import { EditPosComponent } from 'src/app/modals/pos/edit/edit.component';
import { NewPosComponent } from 'src/app/modals/pos/new/new.component';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styles: [
  ]
})
export class PosComponent implements OnInit {

  constructor(
    private webService: WebService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  public pos:Array<PoS> = []
  public isLoading: boolean = true
  public searchString: string = ''

  ngOnInit(): void {
    this.getAll()
  }

  private getAll() {
    this.isLoading = true
    Promise.all([
      this.updatePumps()
    ]).then(() => {
      this.isLoading = false
    })
  }

  private async updatePumps() {
    this.pos = await this.webService.getAllPos()
  }

  public editModal(item: PoS) {
    const modalRef = this.modalService.open(EditPosComponent,
      {
        container: 'app-pos'
      })
    
      modalRef.componentInstance.item = { ...item }
      console.log(modalRef.componentInstance.item)
    modalRef.result.then(
      (closed: string) => {
        console.debug(`Closed reason: ${closed}`)
        if (!closed.includes('Error:')) {
          this.showSuccess(closed)
          this.getAll()
          return
        }
        this.showError(closed)
        return
      },
      ()=>{}
    )
  }
  public newModal() {
    const modalRef = this.modalService.open(NewPosComponent,
      {
        container: 'app-pos'
      })
    modalRef.result.then(
      (closed: string) => {
        console.debug(`Closed reason: ${closed}`)
        if (!closed.includes('Error:')) {
          this.showSuccess(closed)
          this.getAll()
          return
        }
        this.showError(closed)
        return
      },
      ()=>{}
    )
  }
  public newCategoryModal() {
    const modalRef = this.modalService.open(NewCategoryComponent,
      {
        container: 'app-pos'
      })
    modalRef.result.then(
      (closed: string) => {
        console.debug(`Closed reason: ${closed}`)
        if (!closed.includes('Error:')) {
          this.showSuccess(closed)
          this.getAll()
          return
        }
        this.showError(closed)
        return
      },
      ()=>{}
    )
  }

  public editCategoryModal() {
    const modalRef = this.modalService.open(EditTypeComponent,
      {
        container: 'app-pos'
      })
    modalRef.componentInstance.appendToggle()
    modalRef.result.then(
      (closed: string) => {
        console.debug(`Closed reason: ${closed}`)
      },
      ()=>{}
    )
      .finally(() => {
        this.getAll()
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
}
