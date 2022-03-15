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
    icon: "tim-icons icon-chart-pie-36",
    class: ""
  },
  {
    path: "/icons",
    title: "Icons",
    rtlTitle: "الرموز",
    icon: "tim-icons icon-atom",
    class: ""
  },
  {
    path: "/maps",
    title: "Maps",
    rtlTitle: "خرائط",
    icon: "tim-icons icon-pin",
    class: "" },
  {
    path: "/notifications",
    title: "Notifications",
    rtlTitle: "إخطارات",
    icon: "tim-icons icon-bell-55",
    class: ""
  },

  {
    path: "/user",
    title: "User Profile",
    rtlTitle: "ملف تعريفي للمستخدم",
    icon: "tim-icons icon-single-02",
    class: ""
  },
  {
    path: "/tables",
    title: "Table List",
    rtlTitle: "قائمة الجدول",
    icon: "tim-icons icon-puzzle-10",
    class: ""
  },
  {
    path: "/typography",
    title: "Typography",
    rtlTitle: "طباعة",
    icon: "tim-icons icon-align-center",
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
    path: "/pumps",
    title: "Surtidores",
    rtlTitle: "طباعة",
    icon: "fa-solid fa-gas-pump",
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
