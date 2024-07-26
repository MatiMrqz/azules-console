import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'pos-new',
  templateUrl: './new.component.html',
  styles: [
  ]
})
export class NewPosComponent {
  public item: PoS ={
    id:null,
    name:null,
    description:null,
    checkout:0,
    unit_price:1,
  };
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }
  

  public saveItem(){
    this.webService.newPoS(this.item)
    .then((res)=>{
      this.activeModal.close(res.msg)
    })
    .catch(error =>{
      this.activeModal.close(`Error: ${error}`)
    })
  }
}
