import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateChild } from '@angular/router';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { AuthDevService } from './services/auth-dev.service';
import { AuthService } from "./services/auth.service";


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {
    constructor(
        private router: Router,
        private authService: AuthService,
    ) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if (this.authService.loggedIn()) {
            return true;
        }
        this.router.navigate(['/auth/login'])
        console.error('UNAUTHORIZED')
        return false;
    }

}
@Injectable({
    providedIn: 'root'
})
export class AuthGuardDevice implements CanActivateChild {
    constructor(
        private router: Router,
        private authDevService: AuthDevService
    ) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if (this.authDevService.loggedIn()) {
            return true;
        }
        this.router.navigate(['/auth/device'])
        console.error('UNAUTHORIZED DEVICE')
        return false;
    }

}