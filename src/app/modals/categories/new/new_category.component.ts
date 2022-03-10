import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-new-category',
  templateUrl: './new_category.component.html',
  styles: [
  ]
})
export class NewCategoryComponent implements OnInit {
  public item = {
    cname: '',
    description: null
  };
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }


  public saveItem() {
    this.webService.newCategory(this.item)
      .then(() => {
        this.activeModal.close(`Categoría guardada correctamente`)
      })
      .catch(error => {
        this.activeModal.close(`Error: ${error}`)
      })
  }

  ngOnInit(): void { }

}
