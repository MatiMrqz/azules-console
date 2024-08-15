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
    path: "/pos",
    title: "Puntos de Venta",
    icon: "fa-solid fa-cash-register",
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
const menuItems$: Subject<any[]> = new Subject<any[]>();

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent implements OnInit {
  mItems = menuItems$
  local = local
  constructor(
    private webService:WebService
  ) {
    this.webService.getCompanySettings().then(res=>{
      SidebarComponent.setLocal(res.LOCAL_NAME, res.LOCAL_ADDRESS, res.COMPANY_MAIL,res.INVOICING_ENABLED)
    })
  }

  ngOnInit() {
  }

  static setLocal(name:string,address:string,email:string,inv_enabled:boolean){
    local.next({
      name:name,
      address:address,
      email:email
    })
    localStorage.setItem('localName',name)
    localStorage.setItem('localAddress',address)
    localStorage.setItem('localEmail',email)
    if(inv_enabled){
      sessionStorage.setItem('INV_ENABLED',"1")
      menuItems$.next(ROUTES)
    }else{
      sessionStorage.removeItem('INV_ENABLED')
      menuItems$.next(ROUTES.filter(item=>item.path!='/invoices'))
    }
  }
  isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  }
}
