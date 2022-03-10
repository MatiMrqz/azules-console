import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styles: [
  ]
})
export class NewPumpComponent implements OnInit {
  @Input() types:PumpType;
  public item={
    description:null,
    type_id:null,
    meter_init_value:0,
    max_meter_value:1000000,
    unit_price:0,
  };
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }
  

  public saveItem(){
    this.webService.newPump(this.item)
    .then(()=>{
      this.activeModal.close(`Surtidor guardado correctamente`)
    })
    .catch(error =>{
      this.activeModal.close(`Error: ${error}`)
    })
  }

  ngOnInit(): void { }

}
