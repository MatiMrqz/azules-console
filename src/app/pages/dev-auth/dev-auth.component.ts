import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebDevService } from 'src/app/services/web-dev.service';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-dev-auth',
  templateUrl: './dev-auth.component.html',
  styles: [
  ]
})
export class DevAuthComponent implements OnInit {
  public isLoading:boolean=true;
  constructor(
    private route: ActivatedRoute,
    private webDevService:WebDevService,
    private router:Router
  ) { }
  private authToken?: string;
  public serverResponse:string='Validando firma...'
  ngOnInit(): void {
    this.authToken=this.route.snapshot.paramMap.get('authToken')
    console.log(this.authToken)
    if(!this.authToken){
      this.serverResponse = 'Error: Dispositivo no autorizado'
      this.isLoading=false
      return
    }
    this.webDevService.authorizeDevice(this.authToken)
    .then(res=>{
      this.serverResponse=res.msg
      this.isLoading=false
      this.router.navigate(['employee'])
    })
    .catch(err=>{
      this.serverResponse=`Error: ${err.error??err.message}`
      this.isLoading=false
    })
  }


}
