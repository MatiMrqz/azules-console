import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EmployeeLayoutRoutes } from "./employee-layout.routing";
import { NgbAccordionModule, NgbProgressbarModule } from "@ng-bootstrap/ng-bootstrap";
import { CloseTurnComponent, ValidProductsPipe } from "src/app/pages/employee/close-turn.component";
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { OpenTurnComponent } from "src/app/pages/open-turn/open-turn.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EmployeeLayoutRoutes),
    FormsModule,
    NgbAccordionModule,
    NgbProgressbarModule
  ],
  declarations: [
    CloseTurnComponent,
    ValidProductsPipe,
    LoadingComponent,
    OpenTurnComponent,
  ],
  providers:[],

})
export class EmployeeLayoutModule { }
