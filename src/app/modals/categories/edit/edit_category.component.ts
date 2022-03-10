import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit_category.component.html',
  styles: []
})
export class EditCategoryComponent implements OnInit {
  @Input() inCategories: Categories[]
  public categories: any[];
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }

  public appendToggle() {
    this.categories = this.inCategories.map(i => {
      return { editing: false, ...i }
    })
    console.log(this.categories)
  }

  public deleteItem(item: Categories) {
    this.webService.removeCategory(item.id)
      .then(() => {
        const index = this.categories.indexOf(item)
        this.categories.splice(index, 1)
      })
      .catch(err => {
        console.error(err)
      })
  }

  public saveItem(item) {
    console.log(item)
    this.webService.editCategory(item)
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        item.editing = false
      })
  }

  public editItem(item) {
    console.log(item)
    item.editing = !item.editing
  }

  ngOnInit(): void { }

}
