import { Injectable } from '@angular/core';
import { webModule } from 'src/environments/environment.prod';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebService {

  constructor(
    private authService:AuthService
  ) { }

  private headersWithApi = {
    'Content-Type': 'application/json',
    'Api-Key': webModule.apiKey
  }

  public adminLogin(user: { mail: string, pass: string }) {

    return fetch(webModule.baseUrl + '/auth/admin/login', {
      method: 'POST',
      headers: this.headersWithApi,
      body: JSON.stringify(user)
    }).then(
      async res => {
        const data = await res.json()
        if(res.status==200) {
          this.authService.setToken(res.headers.get('authorization'))
          return data
        };
        throw data.error;
      })
  }

}