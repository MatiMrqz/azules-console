import { Routes } from "@angular/router";
import { LoadingComponent } from "src/app/pages/loading/loading.component";
import { dynamicEmployeeRoute } from "./employee-guards";

export const EmployeeLayoutRoutes: Routes = [
  { path: "", component: LoadingComponent, canActivate: [dynamicEmployeeRoute] },

];
