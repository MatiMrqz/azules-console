import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { EmployeeLayoutRoutes } from "./employee-layout.routing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { EmployeeComponent, ValidProductsPipe } from "src/app/pages/employee/employee.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EmployeeLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
  ],
  declarations: [
    EmployeeComponent, ValidProductsPipe
  ]
})
export class EmployeeLayoutModule {}
