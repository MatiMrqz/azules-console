import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EmployeeLayoutRoutes } from "./employee-layout.routing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CloseTurnComponent, ValidProductsPipe } from "src/app/pages/employee/close-turn.component";
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { OpenTurnComponent } from "src/app/pages/open-turn/open-turn.component";
import { DynamicRouteGuard } from "./dynamic-route.guard";
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EmployeeLayoutRoutes),
    FormsModule,
    NgbModule,
  ],
  declarations: [
    CloseTurnComponent,
    ValidProductsPipe,
    LoadingComponent,
    OpenTurnComponent,
  ],
  providers:[DynamicRouteGuard],

})
export class EmployeeLayoutModule { }
