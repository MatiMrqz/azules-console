import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { AdminLayoutRoutes } from "./admin-layout.routing";
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { MapComponent } from "../../pages/map/map.component";
import { NotificationsComponent } from "../../pages/notifications/notifications.component";
import { UserComponent } from "../../pages/user/user.component";
import { TablesComponent } from "../../pages/tables/tables.component";
import { TypographyComponent } from "../../pages/typography/typography.component";
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


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
  ],
  declarations: [
    DashboardComponent,
    UserComponent,
    TablesComponent,
    IconsComponent,
    TypographyComponent,
    NotificationsComponent,
    MapComponent,
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
    UserPipe
  ]
})
export class AdminLayoutModule {}
