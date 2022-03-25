import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token?: string
  constructor(
    private router: Router
  ) {
    this.token = localStorage.getItem('token')
  }

  public loggedIn(): boolean {
    return !!this.token
  }

  public getToken() {
    return this.token
  }

  public setToken(token: string) {
    localStorage.setItem('token', token)
    this.token = token
  }

  public logout() {
    localStorage.removeItem('token')
    this.token = null
    this.router.navigate(['/auth/login']);
  }

}
