import { Component, OnInit } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { WebService } from "src/app/services/web.service";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: "fa-solid fa-house",
  },
  {
    path: "/operations",
    title: "Registro",
    icon: "fa-solid fa-business-time",
  },
  {
    path: "/invoices",
    title: "Facturación",
    icon: "fa-solid fa-receipt",
  },
  {
    path: "/users",
    title: "Usuarios",
    icon: "fa-solid fa-users",
  },
  {
    path: "/pumps",
    title: "Surtidores",
    icon: "fa-solid fa-gas-pump",
  },
  {
    path: "/pos",
    title: "Puntos de Venta",
    icon: "fa-solid fa-store",
  },
  {
    path: "/products",
    title: "Productos",
    icon: "fa-solid fa-store",
  },
  {
    path: "/devices",
    title: "Dispositivos",
    icon: "fa-solid fa-mobile-screen-button",
  },
  {
    path: "/settings",
    title: "Ajustes",
    icon: "fa-solid fa-gear",
  },
];

const local= new BehaviorSubject<{name:string,address:string,email:string}>({name:'-',address:'-',email:'-'})

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  local = local
  constructor(
    private webService:WebService
  ) {
    var localName:string|null = localStorage.getItem('localName')
    var localAddress:string|null = localStorage.getItem('localAddress')
    var localEmail:string|null = localStorage.getItem('localEmail')
    if(!localName){
      this.webService.getCompanySettings().then(res=>{
        localName= res.LOCAL_NAME
        localAddress = res.LOCAL_ADDRESS
        localEmail = res.COMPANY_MAIL
        localStorage.setItem('localName',localName)
        localStorage.setItem('localAddress',localAddress)
        localStorage.setItem('localEmail',localEmail)
        SidebarComponent.setLocal(localName,localAddress,localEmail)
      })
    }else{
      local.next(
        {
          name:localName,
          address:localAddress,
          email:localEmail
        }
      )
    }
  }

  ngOnInit() {

    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }

  static setLocal(name:string,address:string,email:string){
    local.next({
      name:name,
      address:address,
      email:email
    })
    localStorage.setItem('localName',name)
    localStorage.setItem('localAddress',address)
    localStorage.setItem('localEmail',email)
  }
  isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  }
}
