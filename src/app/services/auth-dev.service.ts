import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthDevService {
  constructor(
    private router: Router
  ) { }

  private token: string | null = localStorage.getItem('devToken')

  public loggedIn(): boolean {
    console.debug('Device login check')
    return !!this.token
  }

  public getToken() {
    return this.token
  }

  public setToken(token: string) {
    localStorage.setItem('devToken', token)
    this.token = token
  }

  public logout() {
    localStorage.removeItem('devToken')
    this.token = null
    this.router.navigate(['/auth/device']);
  }

}
