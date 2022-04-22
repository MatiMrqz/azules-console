import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LOCALE_ID, NgModule } from "@angular/core";
import { registerLocaleData  } from "@angular/common";
import localeEs from '@angular/common/locales/es-AR'
registerLocaleData(localeEs,'es-AR');
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppRoutingModule } from "./app-routing.module";
import { ComponentsModule } from "./components/components.module";
import { EmployeeLayoutComponent } from "./layouts/employee-layout/employee-layout.component";
import { WebModule } from "./services/web.module";
import { OperationDetailComponent } from "./pages/operation-detail/operation-detail.component";
import { NgxPrinterModule } from "ngx-printer";
@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    WebModule.forRoot(),
    NgxPrinterModule.forRoot({
      printPreviewOnly:false,
      renderClass: "printClass",
      printOpenWindow:false
    })
  ],
  declarations: [AppComponent, AdminLayoutComponent, AuthLayoutComponent, EmployeeLayoutComponent, OperationDetailComponent ],
  providers: [{provide: LOCALE_ID, useValue:'es-AR'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
