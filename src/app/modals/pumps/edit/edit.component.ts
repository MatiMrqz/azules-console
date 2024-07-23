import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styles: [
  ]
})
export class EditPumpComponent implements OnInit {
  @Input() item:Pumps;
  @Input() types:Array<PumpType>;
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }

  public saveItem(){
    delete this.item.meter
    this.webService.editPump(this.item)
    .then(()=>{
      this.activeModal.close(`Surtidor #${this.item.id} guardado correctamente`)
    })
    .catch(error =>{
      this.activeModal.close(`Error: ${error}`)
    })
  }

  ngOnInit(): void { }

}
