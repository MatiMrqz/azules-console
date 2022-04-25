import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'modal-max-val-edit',
  templateUrl: './max-val-gral.component.html',
  styles: [
  ]
})
export class EditGralMeterMax implements OnInit {
  @Input() maxVal:number;
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }

  public saveItem(){
    this.webService.setGralMeterMax(this.maxVal)
    .then(()=>{
      this.activeModal.close(`Valor actualizado correctamente`)
    })
    .catch(error =>{
      this.activeModal.dismiss(`Error: ${error}`)
    })
  }

  ngOnInit(): void { }

}
