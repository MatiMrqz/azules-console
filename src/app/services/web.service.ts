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
  private headersWithApiandAuth = {
    'Content-Type': 'application/json',
    'Api-Key': webModule.apiKey,
    'Authorization': localStorage.getItem('token')
  }

  private updateToken(token?:string){
    if(!token){
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
        if(res.status==200) {
          this.authService.setToken(res.headers.get('authorization'))
          return data
        };
        throw data.error;
      })
  }

  public getAllProducts():Promise<Array<any>>{
    return fetch(webModule.baseUrl + '/products/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if(res.status==200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }

  public getAllCategories():Promise<Array<any>>{
    return fetch(webModule.baseUrl + '/products/categories/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if(res.status==200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }

  public updateProduct(item:Products):Promise<any>{
    console.debug(item)
    return fetch(webModule.baseUrl + `/products/update/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body:JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if(res.status==200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public newProduct(item):Promise<any>{
    console.debug(item)
    return fetch(webModule.baseUrl + '/products/new/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body:JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if(res.status==200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public newCategory(item):Promise<any>{
    return fetch(webModule.baseUrl + '/products/categories/new/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body:JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if(res.status==200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public removeCategory(id:number){
    return fetch(webModule.baseUrl + `/products/categories/${id}`, {
      method: 'DELETE',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if(res.status==200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
  public editCategory(item:Categories){
    return fetch(webModule.baseUrl + `/products/categories/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body:JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if(res.status==200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        };
        throw data.error;
      })
  }
}