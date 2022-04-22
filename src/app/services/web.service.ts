import { Injectable } from '@angular/core';
import { webModule } from 'src/environments/environment.prod';
import { AuthDevService } from './auth-dev.service';
import { AuthService } from './auth.service';

@Injectable()
export class WebService {

  constructor(
    private authService: AuthService,
    private authDevService: AuthDevService
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
  private headersWithApiandDevAuth = {
    'Content-Type': 'application/json',
    'Api-Key': webModule.apiKey,
    'Authorization': this.authDevService.getToken()
  }

  private updateToken(token?: string) {
    if (!token) {
      return
    }
    console.debug('Setting new AuthToken')
    this.authService.setToken(token)
    this.headersWithApiandAuth = {
      'Content-Type': 'application/json',
      'Api-Key': webModule.apiKey,
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
      'Api-Key': webModule.apiKey,
      'Authorization': this.authDevService.getToken()
    }
  }

  public async adminLogin(user: { mail: string, pass: string }) {
    return fetch(webModule.baseUrl + '/auth/admin/login', {
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
    return fetch(webModule.baseUrl + '/auth/admin/new', {
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
    return fetch(webModule.baseUrl + '/products/', {
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

  public getAllProductsDev(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/products/', {
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
    return fetch(webModule.baseUrl + '/products/categories/', {
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
    return fetch(webModule.baseUrl + '/products/categories/', {
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllPumpsDev(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/pumps/', {
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
    return fetch(webModule.baseUrl + '/pumps/gral-meter', {
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
    return fetch(webModule.baseUrl + '/pumps/gral-meter', {
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllPumpTypesDev(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/pumps/type/', {
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
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
        }
        else if (res.status == 401) {
          this.authService.logout()
        }
        throw data.error;
      })
  }
  public getUsers(): Promise<Array<any>> {
    return fetch(webModule.baseUrl + '/employees/all', {
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
    return fetch(webModule.baseUrl + `/employees/${item.uuid}`, {
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
    return fetch(webModule.baseUrl + '/auth/employee/new', {
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
    return fetch(webModule.baseUrl + `/employees/changePass/${uuid}`, {
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
    return fetch(webModule.baseUrl + '/employees/turns', {
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
    return fetch(webModule.baseUrl + '/employees/turns', {
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
    return fetch(webModule.baseUrl + '/employees/turns/', {
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
    return fetch(webModule.baseUrl + `/employees/turns/${item.name}`, {
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
    return fetch(webModule.baseUrl + `/employees/turns/${name}`, {
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
  public shiftClosingDev(operation: object): Promise<any> {
    return fetch(webModule.baseUrl + '/operations/close/', {
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
    return fetch(webModule.baseUrl + '/operations/open', {
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
    return fetch(webModule.baseUrl + '/operations/', {
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
    return fetch(webModule.baseUrl + '/operations/', {
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
    return fetch(webModule.baseUrl + '/employees/all', {
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
    return fetch(webModule.baseUrl + `/employees/uuid/${uuid}`, {
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
    return fetch(webModule.baseUrl + `/operations/report/all`, {
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
    return fetch(webModule.baseUrl + `/operations/report/byturns`, {
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
    return fetch(webModule.baseUrl + `/operations/report/gassold`, {
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
    return fetch(webModule.baseUrl + `/device/authorize/${authToken}`, {
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
    return fetch(webModule.baseUrl + '/operations/report/byemployee', {
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
  public getOperationDetailbyId(id:number): Promise<{operation:DetailOperationDB,products:Array<DetailProducts>,pumps:Array<DetailPumps>,accountancy:DetailAccountancy}> {
    return fetch(webModule.baseUrl + `/operations/${id}`, {
      method: 'GET',
      headers: this.headersWithApiandAuth,
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          this.updateToken(res.headers.get('authorization'))
          return data as {operation:DetailOperationDB,products:Array<DetailProducts>,pumps:Array<DetailPumps>,accountancy:DetailAccountancy}
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
  public getAllOperations(period?:"1M"|"1Y"|"5Y"):Promise<Array<Operation>>{
    return fetch(webModule.baseUrl + `/operations/all/${period}`, {
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
  public registerNewAdmin(userData):Promise<void>{
    return fetch(webModule.baseUrl + '/auth/admin/registration', {
      method: 'POST',
      headers: this.headersWithApiandAuth,
      body:JSON.stringify(userData)
    }).then(
      async res => {
        const data = await res.json()
        if (res.status == 200) {
          return
        }
        throw data.error;
      })//Ver si agregar catch para cuando no hay conexion a internet
  }
}
