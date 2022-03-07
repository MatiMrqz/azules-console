import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router
  ) { }

  public loggedIn():boolean{
    return !!localStorage.getItem('token')
  }

  public getToken(){
    return localStorage.getItem('token')
  }
  
  public setToken(token:string){
    localStorage.setItem('token',token)
  }

  public logout(){
    localStorage.removeItem('token')
    this.router.navigate(['/login']);
  }

}
