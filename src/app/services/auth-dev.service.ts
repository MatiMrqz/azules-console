import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthDevService {
  constructor(
    private router: Router
  ) { }

  public loggedIn():boolean{
    console.debug('Device login check')
    return !!localStorage.getItem('devToken')
  }

  public getToken(){
    return localStorage.getItem('devToken')
  }
  
  public setToken(token:string){
    localStorage.setItem('devToken',token)
  }

  public logout(){
    localStorage.removeItem('devToken')
    this.router.navigate(['/auth/device']);
  }

}
