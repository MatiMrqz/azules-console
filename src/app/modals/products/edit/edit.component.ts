import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styles: [
  ]
})
export class EditProductComponent implements OnInit {
  @Input() item:Products;
  @Input() categories:Categories;
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }
  
  public toggleHiddenProperty(){
    this.item.hidden = !this.item.hidden
    this.webService.updateProduct({id:this.item.id,hidden:this.item.hidden} as Products)
    .then(()=>{
      this.activeModal.close(this.item.hidden?`Producto #${this.item.id} archivado`:`Producto #${this.item.id} desarchivado`)
    })
    .catch(error =>{
      this.activeModal.close(`Error: ${error}`)
    })
  }

  public saveItem(){
    this.webService.updateProduct(this.item)
    .then(()=>{
      this.activeModal.close(`Producto #${this.item.id} guardado correctamente`)
    })
    .catch(error =>{
      this.activeModal.close(`Error: ${error}`)
    })
  }

  ngOnInit(): void { }

}
