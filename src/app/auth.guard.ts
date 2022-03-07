import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateChild } from '@angular/router';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { AuthService } from "./services/auth.service";


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {
    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if (this.authService.loggedIn()) {
            return true;
        }
        this.router.navigate(['/login'])
        console.error('UNAUTHORIZED')
        return false;
    }

}