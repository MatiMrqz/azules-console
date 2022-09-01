import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { AdminLayoutRoutes } from "./admin-layout.routing";
import { DashboardComponent, OpByUname } from "../../pages/dashboard/dashboard.component";
import { ProductsComponent } from "src/app/pages/products/products.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ProductPipe } from "src/app/pipes/product.pipe";
import { EditProductComponent } from "src/app/modals/products/edit/edit.component";
import { NewProductComponent } from "src/app/modals/products/new/new.component";
import { NewCategoryComponent } from "src/app/modals/categories/new/new_category.component";
import { EditCategoryComponent } from "src/app/modals/categories/edit/edit_category.component";
import { PumpsComponent } from "src/app/pages/pumps/pumps.component";
import { EditPumpComponent } from "src/app/modals/pumps/edit/edit.component";
import { NewPumpComponent } from "src/app/modals/pumps/new/new.component";
import { EditTypeComponent } from "src/app/modals/pump_types/edit/edit_type.component";
import { DevicesComponent } from "src/app/pages/devices/devices.component";
import { UsersComponent } from "src/app/pages/users/users.component";
import { UserPipe } from "src/app/pipes/user.pipe";
import { DateAgoPipe } from "src/app/pipes/date-ago.pipe";
import { OperationsComponent } from "src/app/pages/operations/operations.component";
import { EditGralMeterMax } from "src/app/modals/pumps/gral-meter/max-val-gral.component";
import { ClipboardModule } from "ngx-clipboard";
import { InvoicesComponent } from "src/app/pages/invoices/invoices.component";
import { SettingsComponent } from "src/app/pages/settings/settings.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    ClipboardModule,
  ],
  declarations: [
    DashboardComponent,
    ProductsComponent,
    ProductPipe,
    EditProductComponent,
    NewProductComponent,
    NewCategoryComponent,
    EditCategoryComponent,
    PumpsComponent,
    EditPumpComponent,
    NewPumpComponent,
    EditTypeComponent,
    DevicesComponent,
    UsersComponent,
    UserPipe,
    OpByUname,
    DateAgoPipe,
    OperationsComponent,
    EditGralMeterMax,
    InvoicesComponent,
    SettingsComponent
  ],
  providers:[]
})
export class AdminLayoutModule {}
