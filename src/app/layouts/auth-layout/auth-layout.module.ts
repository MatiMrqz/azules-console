import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutRoutes } from './auth-layout.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from "@angular/common/http";

import { LoginComponent } from 'src/app/pages/login/login.component';
import { DevAuthComponent } from 'src/app/pages/dev-auth/dev-auth.component';
import { RegisterComponent } from 'src/app/pages/register/register.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
  ],
  declarations: [
    LoginComponent,
    DevAuthComponent,
    RegisterComponent
  ],
  providers:[]
})
export class AuthLayoutModule { }
