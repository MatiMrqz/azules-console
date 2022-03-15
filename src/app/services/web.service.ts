import { Injectable } from '@angular/core';
import { webModule } from 'src/environments/environment.prod';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebService {

  constructor(
    private authService: AuthService
  ) { }

  private headersWithApi = {
    'Content-Type': 'application/json',
    'Api-Key': webModule.apiKey
  }
  private headersWithApiandAuth = {
    'Content-Type': 'application/json',
    'Api-Key': webModule.apiKey,
    'Authorization': this.authService.getToken()
  }

  private updateToken(token?: string) {
    if (!token) {
      return
    }
    console.log('Setting new token')
    this.authService.setToken(token)
  }

  public adminLogin(user: { mail: string, pass: string }) {
    return fetch(webModule.baseUrl + '/auth/admin/login', {
      method: 'POST',
      headers: this.headersWithApi,
      body: JSON.stringify(user)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.authService.setToken(res.headers.get('authorization'))
          return data
        };
        throw data.error;
      })
  }

  public getAllProducts(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/products/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }

  public getAllCategories(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/products/categories/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }

  public updateProduct(item: Products): Promise<any> {
    console.debug(item)
    return fetch(webModule.baseUrl + `/products/update/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public newProduct(item): Promise<any> {
    console.debug(item)
    return fetch(webModule.baseUrl + '/products/new/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public newCategory(item): Promise<any> {
    return fetch(webModule.baseUrl + '/products/categories/new/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public removeCategory(id: number) {
    return fetch(webModule.baseUrl + `/products/categories/${id}`, {
      method: 'DELETE',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public editCategory(item: Categories) {
    return fetch(webModule.baseUrl + `/products/categories/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public getAllPumps(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/pumps/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public getAllPumpTypes(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/pumps/type/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public editPump(item: Pumps) {
    return fetch(webModule.baseUrl + `/pumps/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public newPump(item): Promise<any> {
    console.debug(item)
    return fetch(webModule.baseUrl + '/pumps/add/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public editPumpType(item: PumpType) {
    return fetch(webModule.baseUrl + `/pumps/type/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public removePumpType(id: number) {
    return fetch(webModule.baseUrl + `/pumps/type/${id}`, {
      method: 'DELETE',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public addPumpType(item): Promise<any> {
    return fetch(webModule.baseUrl + '/pumps/type/add', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public getDevices(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/device/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public setDeviceAlias(uuid: string, alias: string) {
    return fetch(webModule.baseUrl + `/device/setAlias/${uuid}`, {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ alias })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public deleteDevice(uuid: string) {
    return fetch(webModule.baseUrl + `/device/${uuid}`, {
      method: 'DELETE',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public generateAuthorization(): Promise<{ next: string, authToken: string }> {
    return fetch(webModule.baseUrl + '/device/generateValidationToken', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as { next: string, authToken: string }
        };
        throw data.error;
      })
  }
}