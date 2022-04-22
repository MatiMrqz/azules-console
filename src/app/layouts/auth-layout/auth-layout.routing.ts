import { Routes } from '@angular/router';
import { DevAuthComponent } from 'src/app/pages/dev-auth/dev-auth.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { RegisterComponent } from 'src/app/pages/register/register.component';

// import { RtlComponent } from '../../pages/rtl/rtl.component';


export const AuthLayoutRoutes: Routes = [
    { path: 'login',component: LoginComponent },
    { path: 'device',component: DevAuthComponent,pathMatch:"full" },
    { path: 'device/:authToken',component: DevAuthComponent },
    { path: 'register/:token',component: RegisterComponent,pathMatch:"full" },
];
