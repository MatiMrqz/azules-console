import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token:string|null= localStorage.getItem('token')
  constructor(
    private router: Router
  ) {}

  public loggedIn(): boolean {
    return !!this.token
  }

  public getToken():string|null {
    return this.token
  }

  public setToken(token: string) {
    localStorage.setItem('token', token)
    this.token=token
  }

  public logout() {
    localStorage.removeItem('token')
    this.token=null
    this.router.navigate(['/auth/login']);
  }

}
