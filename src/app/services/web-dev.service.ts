import { Injectable } from '@angular/core';
import { webModule } from 'src/environments/environment.prod';
import { AuthDevService } from './auth-dev.service';

@Injectable({
  providedIn: 'root'
})
export class WebDevService {

  constructor(
    private authDevService: AuthDevService
  ) { }

  private updateToken(token?: string) {
    if (!token) {
      return
    }
    console.log('Setting new token')
    this.authDevService.setToken(token)
  }

  private headersWithApi = {
    'Content-Type': 'application/json',
    'Api-Key': webModule.apiKey
  }
  private headersWithApiandAuth = {
    'Content-Type': 'application/json',
    'Api-Key': webModule.apiKey,
    'Authorization': this.authDevService.getToken()
  }

  public authorizeDevice(authToken: string): Promise<any> {
    return fetch(webModule.baseUrl + `/device/authorize/${authToken}`, {
      method: 'GET',
      headers: this.headersWithApi,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any
        };
        throw data.error;
      })
  }

}
