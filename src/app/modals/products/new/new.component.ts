import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styles: [
  ]
})
export class NewProductComponent implements OnInit {
  @Input() categories:Array<Categories>;
  public item={
    name:'',
    description:null,
    category_id:null,
    unit_price:0,
    stock:0
  };
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }
  

  public saveItem(){
    this.webService.newProduct(this.item)
    .then(()=>{
      this.activeModal.close(`Producto guardado correctamente`)
    })
    .catch(error =>{
      this.activeModal.close(`Error: ${error}`)
    })
  }

  ngOnInit(): void { }

}
