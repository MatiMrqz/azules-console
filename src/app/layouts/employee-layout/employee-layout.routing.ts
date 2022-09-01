import { Routes } from "@angular/router";
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { DynamicRouteGuard } from "./dynamic-route.guard";

export const EmployeeLayoutRoutes: Routes = [
  { path: "", component: LoadingComponent, canActivate: [DynamicRouteGuard] },
];
