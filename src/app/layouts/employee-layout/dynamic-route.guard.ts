import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { CloseTurnComponent } from "src/app/pages/employee/close-turn.component";
import { OpenTurnComponent } from "src/app/pages/open-turn/open-turn.component";
import { WebService } from "src/app/services/web.service";

@Injectable()
export class DynamicRouteGuard implements CanActivate {
    constructor(
        private router: Router,
        private webService: WebService
    ) { }
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.webService.getLastOperation()
            .then((operation: OperationEmpDB) => {
                let routes = this.router.config;
                let newRoutes = routes.slice(0, routes.length - 1)
                let path: string
                switch (operation.operation_type) {
                    case 'OPEN':
                        path = 'close'
                        newRoutes.push({ path, component: CloseTurnComponent, data: operation })//CAMBIAR
                        break;
                    case 'CLOSE':
                        path = 'open'
                        newRoutes.push({ path, component: OpenTurnComponent })
                        break;
                    case 'FIRST':
                        path = 'open'
                        newRoutes.push({ path, component: OpenTurnComponent })
                        break;
                    default:
                        throw 'BAD CONFIG ERROR';
                }
                this.router.resetConfig(newRoutes);
                this.router.navigate([path]);
            })
        return true;
    }
}