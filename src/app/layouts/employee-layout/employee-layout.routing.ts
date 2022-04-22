import { Routes } from "@angular/router";
import { CloseTurnComponent } from "src/app/pages/employee/close-turn.component";
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { OpenTurnComponent } from "src/app/pages/open-turn/open-turn.component";
import { DynamicRouteGuard } from "./dynamic-route.guard";

export const EmployeeLayoutRoutes: Routes = [
  { path: "", component: LoadingComponent, canActivate: [DynamicRouteGuard] },
  // { path: "", component: LoadingComponent},
];
