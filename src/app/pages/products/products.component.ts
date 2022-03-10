import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EditCategoryComponent } from 'src/app/modals/categories/edit/edit_category.component';
import { NewCategoryComponent } from 'src/app/modals/categories/new/new_category.component';
import { EditProductComponent } from 'src/app/modals/products/edit/edit.component';
import { NewProductComponent } from 'src/app/modals/products/new/new.component';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styles: [
  ]
})
export class ProductsComponent implements OnInit {

  constructor(
    private webService: WebService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  public products = []
  public categories = []
  public isLoading: boolean = true
  public searchString: string = ''

  ngOnInit(): void {
    this.getAll()
  }

  private getAll() {
    this.isLoading = true
    Promise.all([
      this.updateCategories(),
      this.updateProducts()
    ]).then(() => {
      this.isLoading = false
    })
  }

  private async updateProducts() {
    this.products = await this.webService.getAllProducts()
    console.log(this.products)
  }
  private async updateCategories() {
    this.categories = await this.webService.getAllCategories()
    console.log(this.categories)
  }
  public getCategorybyId(id?: number) {
    if (!id) return null
    return this.categories.find(c => c.id == id) ?? '-'
  }

  public editModal(item: Products) {
    const modalRef = this.modalService.open(EditProductComponent,
      {
        container: 'app-products'
      })
    modalRef.componentInstance.item = { ...item }
    modalRef.componentInstance.categories = this.categories
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
    const modalRef = this.modalService.open(NewProductComponent,
      {
        container: 'app-products'
      })
    modalRef.componentInstance.categories = this.categories
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
        container: 'app-products'
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
    const modalRef = this.modalService.open(EditCategoryComponent,
      {
        container: 'app-products'
      })
    modalRef.componentInstance.inCategories = this.categories
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
