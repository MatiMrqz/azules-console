import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { ProductsComponent } from "src/app/pages/products/products.component";
import { PumpsComponent } from "src/app/pages/pumps/pumps.component";
import { DevicesComponent } from "src/app/pages/devices/devices.component";
import { UsersComponent } from "src/app/pages/users/users.component";
import { OperationsComponent } from "src/app/pages/operations/operations.component";
import { InvoicesComponent } from "src/app/pages/invoices/invoices.component";
import { SettingsComponent } from "src/app/pages/settings/settings.component";

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "products", component: ProductsComponent },
  { path: "pumps", component: PumpsComponent },
  { path: "devices", component: DevicesComponent },
  { path: "users", component: UsersComponent },
  { path: "operations", component: OperationsComponent },
  { path: "invoices", component: InvoicesComponent },
  { path: "settings", component: SettingsComponent },
];
