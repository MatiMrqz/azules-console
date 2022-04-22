import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-open-turn',
  templateUrl: './open-turn.component.html',
  styles: []
})
export class OpenTurnComponent implements OnInit {
  constructor(
    private webService: WebService,
    private toastr: ToastrService,
    private router: Router
  ) { }
  public saving: boolean = false
  public turns: any[]
  public products: any[]
  public pumps: any[]
  public employees: Employee[]
  public categories: any[]
  public gralMeter
  public pump_types = []
  public isLoading: boolean = true
  public async getTurns() {
    this.turns = await this.webService.getTurnsDev()
  }

  private getAll() {
    this.isLoading = true
    Promise.all([
      this.getTurns(),
      this.updateCategories(),
      this.updateEmployeesList(),
      this.updateProducts(),
      this.updatePumps(),
      this.getPumpTypes(),
      this.updateGralMeter()
    ]).then(() => {
      this.isLoading = false
    })
  }

  private async updateProducts() {
    const tempProducts = await this.webService.getAllProductsDev()
    this.products = tempProducts.filter(p => !p.hidden)
    console.log(this.products)
  }
  private async updateCategories() {
    this.categories = await this.webService.getAllCategoriesDev()
    console.log(this.categories)
  }
  public getCategorybyId(id?: number) {
    if (!id) return null
    return this.categories.find(c => c.id == id) ?? '-'
  }

  public async updatePumps() {
    this.pumps = await this.webService.getAllPumpsDev()
    console.log(this.pumps)
  }

  public async updateEmployeesList() {
    const tempEmployees = await this.webService.getEmployeesDev()
    this.employees = tempEmployees.filter(v=>!v.hidden)
    console.log(this.employees)
  }

  public async updateGralMeter() {
    this.gralMeter = await this.webService.getGralMeterDev()
    console.log(this.gralMeter)
  }

  public async getPumpTypes() {
    this.pump_types = await this.webService.getAllPumpTypesDev()
    console.log(this.pump_types)
  }
  public getTypebyId(id: number) {
    return this.pump_types.find(c => c.id == id) ?? '-'
  }

  public sendToApi(f: object) {
    this.saving = true
    this.webService.shiftOpeningDev(f)
      .then(
        res => {
          this.showSuccess(res.msg)
          setTimeout(() => {
            this.router.navigate(['employee'])
          }, 500)
        }
      )
      .catch(
        err => {
          this.saving = false
          if (err.includes('password')) err = 'Contraseña errónea. Intente nuevamente.'
          this.showError(err)
        }
      )
  }

  private showError(msg: string) {
    this.toastr.error('<span class="tim-icons icon-simple-remove" [data-notify]="icon"></span>' + msg, '', {
      timeOut: 5000,
      enableHtml: true,
      toastClass: "alert alert-danger alert-with-icon",
      positionClass: 'toast-top-center'
    });
  }

  private showSuccess(msg: string) {
    this.toastr.success('<span class="tim-icons icon-check-2" [data-notify]="icon"></span>' + msg, '', {
      timeOut: 5000,
      enableHtml: true,
      toastClass: "alert alert-success alert-with-icon",
      positionClass: 'toast-top-center'
    });
  }

  ngOnInit(): void {
    this.getAll()
  }

}
