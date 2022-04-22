import { Component, OnInit } from "@angular/core";

declare interface RouteInfo {
  path: string;
  title: string;
  rtlTitle: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    rtlTitle: "لوحة القيادة",
    icon: "fa-solid fa-house",
    class: ""
  },
  {
    path: "/operations",
    title: "Registro",
    rtlTitle: "طباعة",
    icon: "fa-solid fa-business-time",
    class: ""
  },
  {
    path: "/users",
    title: "Usuarios",
    rtlTitle: "طباعة",
    icon: "fa-solid fa-users",
    class: ""
  },
  {
    path: "/pumps",
    title: "Surtidores",
    rtlTitle: "طباعة",
    icon: "fa-solid fa-gas-pump",
    class: ""
  },
  {
    path: "/products",
    title: "Productos",
    rtlTitle: "طباعة",
    icon: "fa-solid fa-store",
    class: ""
  },
  {
    path: "/devices",
    title: "Dispositivos",
    rtlTitle: "طباعة",
    icon: "fa-solid fa-mobile-screen-button",
    class: ""
  },
  
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() {}

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  }
}
