import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard, AuthGuardDevice } from "./auth.guard";
import { EmployeeLayoutComponent } from "./layouts/employee-layout/employee-layout.component";
import { OperationDetailComponent } from "./pages/operation-detail/operation-detail.component";

const routes: Routes = [
  {
    path: "employee",
    component:EmployeeLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () => import ("./layouts/employee-layout/employee-layout.module").then(m => m.EmployeeLayoutModule)
      },
      {
        path: "**",
        redirectTo:"",
      },
    ],
    canActivateChild:[AuthGuardDevice]
  },
  {
    path: "operations/detail/:id",
    component: OperationDetailComponent,
    canActivate:[AuthGuard]
  },
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full"
  },
  {
    path: "",
    component: AdminLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () => import ("./layouts/admin-layout/admin-layout.module").then(m => m.AdminLayoutModule)
      }
    ],
    canActivateChild:[AuthGuard]
  },
  {
    path: "auth",
    component: AuthLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () => import ("./layouts/auth-layout/auth-layout.module").then(m => m.AuthLayoutModule)
      }
    ]
  },
  {
    path: "**",
    redirectTo: "dashboard"
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
