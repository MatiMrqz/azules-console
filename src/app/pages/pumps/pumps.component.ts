import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NewCategoryComponent } from 'src/app/modals/categories/new/new_category.component';
import { EditPumpComponent } from 'src/app/modals/pumps/edit/edit.component';
import { NewPumpComponent } from 'src/app/modals/pumps/new/new.component';
import { EditTypeComponent } from 'src/app/modals/pump_types/edit/edit_type.component';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-pumps',
  templateUrl: './pumps.component.html',
  styles: [
  ]
})
export class PumpsComponent implements OnInit {

  constructor(
    private webService: WebService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  public pumps = []
  public types = []
  public isLoading: boolean = true
  public searchString: string = ''

  ngOnInit(): void {
    this.getAll()
  }

  private getAll() {
    this.isLoading = true
    Promise.all([
      this.updateTypes(),
      this.updatePumps()
    ]).then(() => {
      this.isLoading = false
    })
  }

  private async updatePumps() {
    this.pumps = await this.webService.getAllPumps()
    console.log(this.pumps)
  }
  private async updateTypes() {
    this.types = await this.webService.getAllPumpTypes()
    console.log(this.types)
  }
  public getTypebyId(id: number) {
    return this.types.find(c => c.id == id) ?? '-'
  }

  public editModal(item: Products) {
    const modalRef = this.modalService.open(EditPumpComponent,
      {
        container: 'app-pumps'
      })
    modalRef.componentInstance.item = { ...item }
    modalRef.componentInstance.types = this.types
    modalRef.result.then(
      (closed: string) => {
        console.log(`Closed reason: ${closed}`)
        if (!closed.includes('Error:')) {
          this.showSuccess(closed)
          this.getAll()
          return
        }
        this.showError(closed)
        return
      },
      dismissed => {
        console.log(`Dissmiss reason: ${dismissed}`)
      }
    )
  }
  public newModal() {
    const modalRef = this.modalService.open(NewPumpComponent,
      {
        container: 'app-pumps'
      })
    modalRef.componentInstance.types = this.types
    modalRef.result.then(
      (closed: string) => {
        console.log(`Closed reason: ${closed}`)
        if (!closed.includes('Error:')) {
          this.showSuccess(closed)
          this.getAll()
          return
        }
        this.showError(closed)
        return
      },
      dismissed => {
        console.log(`Dissmiss reason: ${dismissed}`)
      }
    )
  }
  public newCategoryModal() {
    const modalRef = this.modalService.open(NewCategoryComponent,
      {
        container: 'app-pumps'
      })
    modalRef.result.then(
      (closed: string) => {
        console.log(`Closed reason: ${closed}`)
        if (!closed.includes('Error:')) {
          this.showSuccess(closed)
          this.getAll()
          return
        }
        this.showError(closed)
        return
      },
      dismissed => {
        console.log(`Dissmiss reason: ${dismissed}`)
      }
    )
  }

  public editCategoryModal() {
    const modalRef = this.modalService.open(EditTypeComponent,
      {
        container: 'app-pumps'
      })
    modalRef.componentInstance.inTypes = this.types
    modalRef.componentInstance.appendToggle()
    modalRef.result.then(
      (closed: string) => {
        console.log(`Closed reason: ${closed}`)
      },
      dismissed => {
        console.log(`Dissmiss reason: ${dismissed}`)
      }
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
