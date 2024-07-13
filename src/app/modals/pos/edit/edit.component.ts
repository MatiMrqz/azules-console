import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'pos-edit',
  templateUrl: './edit.component.html',
  styles: [
  ]
})
export class EditPosComponent {
  @Input() item:PoS;
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) {
  }

  public saveItem(){
    this.webService.editPos(this.item)
    .then(()=>{
      this.activeModal.close(`Surtidor #${this.item.id} guardado correctamente`)
    })
    .catch(error =>{
      this.activeModal.close(`Error: ${error}`)
    })
  }

}
