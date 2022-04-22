import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: [
  ]
})
export class RegisterComponent implements OnInit {
  
  private token: string;
  public isLoading: boolean = false;

  constructor(
    private toastr:ToastrService,
    private webService:WebService,
    private route:ActivatedRoute,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.token=this.route.snapshot.paramMap.get('token')
  }

  public sendToApi(f:any){
    this.isLoading=true
    if (f.pass!==f.pass1){
    this.showError('Las contraseñas no coinciden. Intente nuevamente.')
    return
    }
    this.webService.registerNewAdmin({token:this.token, ...f})
    .then(()=>{
      this.showSuccess('Registro exitoso!')
      setTimeout(() => {
        this.router.navigate(['auth/login'])
        this.isLoading=false
      }, 500);
    })
    .catch(err=>{
      this.showError(err)
      setTimeout(() => {
        this.isLoading=false
      }, 1500);
    })
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

  private showPrimary(msg: string) {
    this.toastr.success('<span class="tim-icons icon-alert-circle-exc" [data-notify]="icon"></span>' + msg, '', {
      timeOut: 5000,
      enableHtml: true,
      toastClass: "alert alert-primary alert-with-icon",
      positionClass: 'toast-top-center'
    });
  }

}
