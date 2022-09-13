import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthDevService } from './auth-dev.service';
import { AuthService } from './auth.service';

@Injectable()
export class WebService {

  constructor(
    private authService: AuthService,
    private authDevService: AuthDevService
  ) {
    console.debug('Web service loading...')
  }

  private headersWithApi = {
    'Content-Type': 'application/json',
    'Api-Key': environment.apiKey
  }
  private headersWithApiandAuth = {
    'Content-Type': 'application/json',
    'Api-Key': environment.apiKey,
    'Authorization': this.authService.getToken()
  }
  private headersWithApiandDevAuth = {
    'Content-Type': 'application/json',
    'Api-Key': environment.apiKey,
    'Authorization': this.authDevService.getToken()
  }
  private headersWithApiandAutoAuth(){
    return {
    'Content-Type': 'application/json',
    'Api-Key': environment.apiKey,
    'Authorization': this.validToken()
  }
  } 

  private validToken():string{
    if(this.authDevService.loggedIn()==false){
      return this.authService.getToken()
    }
    return this.authDevService.getToken()
  }

  private updateAutoToken(token?:string){
    if (!token){
      return
    }
    console.debug('Setting new token')
    if(this.authDevService.getToken()==null){
      this.authService.setToken(token)
    }else{
      this.authDevService.setToken(token)
    }
  }

  private updateToken(token?: string) {
    if (!token) {
      return
    }
    console.debug('Setting new AuthToken')
    this.authService.setToken(token)
    this.headersWithApiandAuth = {
      'Content-Type': 'application/json',
      'Api-Key': environment.apiKey,
      'Authorization': this.authService.getToken()
    }
  }

  private updateDevToken(token?: string) {
    if (!token) {
      return
    }
    console.log('Setting new Dev AuthToken')
    this.authDevService.setToken(token)
    this.headersWithApiandDevAuth = {
      'Content-Type': 'application/json',
      'Api-Key': environment.apiKey,
      'Authorization': this.authDevService.getToken()
    }
  }

  public async adminLogin(user: { mail: string, pass: string }) {
    return fetch(environment.baseUrl + '/auth/admin/login', {
      method: 'POST',
      headers: this.headersWithApi,
      body: JSON.stringify(user)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          // this.authService.setToken(res.headers.get('authorization'))
          return data
        };

        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }

  public newAdmin(mail: string) {
    return fetch(environment.baseUrl + '/auth/admin/new', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ mail })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.authService.setToken(res.headers.get('authorization'))
          return data
        };
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }

  public getAllProducts(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/products/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }

  public getAllProductsAutoHdr(): Promise<Array<Products>> {
    return fetch(environment.baseUrl + '/products/', {
      method: 'GET',
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllPumpsAutoHdr(): Promise<Array<Pumps>> {
    return fetch(environment.baseUrl + '/pumps/', {
      method: 'GET',
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }

  public getAllProductsDev(): Promise<Array<Products>> {
    return fetch(environment.baseUrl + '/products/', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any[]
        }
        // else if (res.status == 401) {
        //   this.authService.logout()
        // }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }

  public getAllCategories(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/products/categories/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }

  public getAllCategoriesDev(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/products/categories/', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any[]
        }
        // else if (res.status == 401) {
        //   this.authDevService.logout()
        // }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }

  public updateProduct(item: Products): Promise<any> {
    console.debug(item)
    return fetch(environment.baseUrl + `/products/update/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public newProduct(item): Promise<any> {
    console.debug(item)
    return fetch(environment.baseUrl + '/products/new/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public newCategory(item): Promise<any> {
    return fetch(environment.baseUrl + '/products/categories/new/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public removeCategory(id: number) {
    return fetch(environment.baseUrl + `/products/categories/${id}`, {
      method: 'DELETE',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public editCategory(item: Categories) {
    return fetch(environment.baseUrl + `/products/categories/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllPumps(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/pumps/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllPumpsDev(): Promise<Array<Pumps>> {
    return fetch(environment.baseUrl + '/pumps/', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any[]
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getGralMeterDev(): Promise<any> {
    return fetch(environment.baseUrl + '/pumps/gral-meter', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getGralMeter(): Promise<{ accumulated: number }> {
    return fetch(environment.baseUrl + '/pumps/gral-meter', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getGralMeterMax(): Promise<{ gral_meter_max_value: number }> {
    return fetch(environment.baseUrl + '/pumps/gral-meter-max', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public setGralMeterMax(value: number): Promise<{ msg: string }> {
    return fetch(environment.baseUrl + '/pumps/set-gral-meter-max', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ maxValue: value })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllPumpTypes(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/pumps/type/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllPumpTypesDev(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/pumps/type/', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any[]
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public editPump(item: Pumps) {
    return fetch(environment.baseUrl + `/pumps/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public newPump(item): Promise<any> {
    console.debug(item)
    return fetch(environment.baseUrl + '/pumps/add/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public editPumpType(item: PumpType) {
    return fetch(environment.baseUrl + `/pumps/type/${item.id}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public removePumpType(id: number) {
    return fetch(environment.baseUrl + `/pumps/type/${id}`, {
      method: 'DELETE',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public addPumpType(item): Promise<any> {
    return fetch(environment.baseUrl + '/pumps/type/add', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getDevices(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/device/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public setDeviceAlias(uuid: string, alias: string) {
    return fetch(environment.baseUrl + `/device/setAlias/${uuid}`, {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ alias })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public deleteDevice(uuid: string) {
    return fetch(environment.baseUrl + `/device/${uuid}`, {
      method: 'DELETE',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public generateAuthorization(): Promise<{ next: string, authToken: string }> {
    return fetch(environment.baseUrl + '/device/generateValidationToken', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as { next: string, authToken: string }
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })
  }
  public getUsers(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/employees/all', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public editEmployeeData(item: Employee) {
    return fetch(environment.baseUrl + `/employees/${item.uuid}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public newUser(item): Promise<any> {
    return fetch(environment.baseUrl + '/auth/employee/new', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public changeEmployeePass(uuid: string, newPass: string) {
    return fetch(environment.baseUrl + `/employees/changePass/${uuid}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ newPass })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getTurns(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/employees/turns', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getTurnsDev(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/employees/turns', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any[]
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public newTurn(item: { name: string, schedule?: string }): Promise<any> {
    return fetch(environment.baseUrl + '/employees/turns/', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public editTurn(item: { name: string, newName?: string, newSchedule?: string }) {
    return fetch(environment.baseUrl + `/employees/turns/${item.name}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public deleteTurn(name: string) {
    return fetch(environment.baseUrl + `/employees/turns/${name}`, {
      method: 'DELETE',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public shiftClosingDev(operation: object): Promise<{msg:string,id:number,nInvoicesDone:string,emitter:VoucherEmitterData}> {
    return fetch(environment.baseUrl + '/operations/close/', {
      method: 'POST',
      headers: this.headersWithApiandDevAuth,
      body: JSON.stringify(operation)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public shiftOpeningDev(operation: object): Promise<any> {
    return fetch(environment.baseUrl + '/operations/open', {
      method: 'POST',
      headers: this.headersWithApiandDevAuth,
      body: JSON.stringify(operation)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getLastOperation(): Promise<OperationEmpDB> {
    return fetch(environment.baseUrl + '/operations/', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as OperationEmpDB
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getLastOperationDash(): Promise<OperationEmpDB> {
    return fetch(environment.baseUrl + '/operations/', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as OperationEmpDB
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getEmployeesDev(): Promise<Employee[]> {
    return fetch(environment.baseUrl + '/employees/all', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as Employee[]
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getEmployeesbyUuidDev(uuid: string): Promise<Employee> {
    return fetch(environment.baseUrl + `/employees/uuid/${uuid}`, {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as Employee
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getOperationReport(fromDate?: string, toDate?: string): Promise<OperationsReport[]> {
    return fetch(environment.baseUrl + `/operations/report/all`, {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ fromDate, toDate })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getDailybyTurnsReport(fromDate?: string, toDate?: string): Promise<{ turn: string, schedule: string, dailyOperations: OperationsReport[] }[]> {
    return fetch(environment.baseUrl + `/operations/report/byturns`, {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ fromDate, toDate })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getPumpsGasSold(fromDate?: string, toDate?: string): Promise<{ id: number, PUMPS_M3_SOLD: number, timestamp: string }[]> {
    return fetch(environment.baseUrl + `/operations/report/gassold`, {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ fromDate, toDate })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public authorizeDevice(authToken: string): Promise<any> {
    return fetch(environment.baseUrl + `/device/authorize/${authToken}`, {
      method: 'GET',
      headers: this.headersWithApi,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any
        };
        throw data.error;
      })
  }
  public getOperationsSumarybyEmployee(fromDate?: string, toDate?: string): Promise<OperationsEmployeeSummary[]> {
    return fetch(environment.baseUrl + '/operations/report/byemployee', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify({ fromDate, toDate })
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getOperationDetailbyId(id: number): Promise<{ operation: DetailOperationDB, products: Array<DetailProducts>, pumps: Array<DetailPumps>, accountancy: DetailAccountancy, gralMeter: { meter_diff: number, accumulated: number } }> {
    return fetch(environment.baseUrl + `/operations/${id}`, {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as { operation: DetailOperationDB, products: Array<DetailProducts>, pumps: Array<DetailPumps>, accountancy: DetailAccountancy, gralMeter: { meter_diff: number, accumulated: number } }
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getRevisionsHistory(id: number): Promise<Array<OperationBackup>> {
    return fetch(environment.baseUrl + `/operations/history/${id}`, {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public setOperationPassed(id: number): any {
    return fetch(environment.baseUrl + `/operations/passed/${id}`, {
      method: 'POST',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllOperations(period?: "1M" | "1Y" | "5Y"): Promise<Array<Operation>> {
    return fetch(environment.baseUrl + `/operations/all/${period}`, {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as Array<Operation>
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public editOperation(idOperation: number, payload: any): Promise<any> {
    return fetch(environment.baseUrl + `/operations/edit/${idOperation}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(payload)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public registerNewAdmin(userData): Promise<void> {
    return fetch(environment.baseUrl + '/auth/admin/registration', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(userData)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          return
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getHelpers(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/helpers/all', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getHelpersDev(): Promise<Array<any>> {
    return fetch(environment.baseUrl + '/helpers/all', {
      method: 'GET',
      headers: this.headersWithApiandDevAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateDevToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public editHelper(item: Helper) {
    return fetch(environment.baseUrl + `/helpers/${item.uuid}`, {
      method: 'PUT',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as any[]
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public newHelper(item): Promise<any> {
    return fetch(environment.baseUrl + '/helpers/new', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body: JSON.stringify(item)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getInvoicesRecord(interval?: "1M" | "1Y" | "5Y"): Promise<Array<InvoiceRecord>> {
    return fetch(environment.baseUrl + `/invoices/all/${interval}`, {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getVoucherTypes(): Promise<Array<InvoiceVoucherTypes>> {
    return fetch(environment.baseUrl + '/invoices/voucherTypes', {
      method: 'GET',
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public findClientByName(term:string): Promise<Array<InvoiceClient>> {
    return fetch(environment.baseUrl + `/invoices/clients/byName/${term}`, {
      method: 'GET',
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data as Array<InvoiceClient>
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getClientById(id:number): Promise<InvoiceClient> {
    return fetch(environment.baseUrl + `/invoices/clients/${id}`, {
      method: 'GET',
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data as InvoiceClient
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public invoiceInitPoint(): Promise<{DOCUMENTS:AfipTypes[],VOUCHERS:AfipTypes[],ALIQUOT:AfipTypes,DEFAULT_CLIENT:InvoiceClient}> {
    return fetch(environment.baseUrl + '/invoices/new/initpoint', {
      method: 'GET',
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public submitInvoiceAdmin(payload:{payer:InvoiceClient,voucher:{type:number},items:ItemInvoice[]}): Promise<any> {
    return fetch(environment.baseUrl + '/invoices/admin/new', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public submitInvoiceEmployee(payload:{payer:InvoiceClient,voucher:{type:number},items:ItemInvoice[],employee:Partial<Employee>}): Promise<any> {
    return fetch(environment.baseUrl + '/invoices/new', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getInvoicesSummarybyVoucher(payload:{from:string,to?:string}): Promise<any> {
    return fetch(environment.baseUrl + '/invoices/summary/byvoucher', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getInvoiceDetail(n:number,type:number): Promise<any> {
    return fetch(environment.baseUrl + `/invoices/${type}/${n}`, {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getInvoicesSummarybyType(payload:{from:string,to?:string}): Promise<any> {
    return fetch(environment.baseUrl + '/invoices/summary/bytype', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public newCreditNote(payload:{}): Promise<any> {
    return fetch(environment.baseUrl + '/invoices/admin/newCreditNote', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public afipTypes(): Promise<{ALIQUOTS:AfipTypes[],VOUCHERS:AfipTypes[]}> {
    return fetch(environment.baseUrl + '/invoices/types', {
      method: 'GET',
      headers: this.headersWithApiandAutoAuth(),
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getCompanySettings(): Promise<CompanySettings> {
    return fetch(environment.baseUrl + '/settings/company', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAfipSettings(): Promise<AfipSettings> {
    return fetch(environment.baseUrl + '/settings/afip', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAutoInvoiceSettings(): Promise<AutoSettings> {
    return fetch(environment.baseUrl + '/settings/auto', {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public settingSetter(payload:any){
    return fetch(environment.baseUrl + '/settings/set', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body:JSON.stringify(payload)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateAutoToken(res.headers.get('authorization'))
          return data
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
}
