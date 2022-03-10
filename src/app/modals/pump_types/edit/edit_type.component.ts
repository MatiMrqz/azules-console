import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-edit-type',
  templateUrl: './edit_type.component.html',
  styles: []
})
export class EditTypeComponent implements OnInit {
  @Input() inTypes: PumpType[]
  public types: any[];
  public validated: boolean = false
  constructor(
    public activeModal: NgbActiveModal,
    private webService: WebService
  ) { }

  public appendToggle() {
    this.types = this.inTypes.map(i => {
      return { editing: false, ...i }
    })
    console.log(this.types)
  }

  public deleteItem(item: Categories) {
    this.webService.removePumpType(item.id)
      .then(() => {
        const index = this.types.indexOf(item)
        this.types.splice(index, 1)
      })
      .catch(err => {
        console.error(err)
      })
  }

  public saveItem(item) {
    this.webService.editPumpType(item)
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        item.editing = false
      })
  }

  public editItem(item) {
    item.editing = !item.editing
  }
  public addItem(nameElement:HTMLInputElement, unitElement:HTMLInputElement) {
    const name = nameElement.value
    const unit = unitElement.value
    console.log(name+unit)
    this.validated=true
    if(!name) return
    if(!unit) return
    this.webService.addPumpType({name,unit})
    .then(()=>{
      nameElement.value=''
      unitElement.value=''
      this.types = [{editing:false,id:this.types.length+1,name,unit},...this.types]
      this.validated=false
    })
  }
  ngOnInit(): void { }

}
