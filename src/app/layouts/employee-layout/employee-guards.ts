import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { CloseTurnComponent } from "src/app/pages/employee/close-turn.component";
import { OpenTurnComponent } from "src/app/pages/open-turn/open-turn.component";
import { WebService } from "src/app/services/web.service";

export const dynamicEmployeeRoute: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router)
  let routes = router.config;
  let newRoutes = routes.slice(0, routes.length - 1)
  let path: string
  const operation = await (inject(WebService).getLastOperation())
  switch (operation.operation_type) {
    case "OPEN":
      path = 'close';
      newRoutes.push({ path, component: CloseTurnComponent, data: operation })//CAMBIAR
      break;
    case "CLOSE":
      path = 'open';
      newRoutes.push({ path, component: OpenTurnComponent })
      break;
    case 'FIRST':
      path = 'open'
      newRoutes.push({ path, component: OpenTurnComponent })
      break;
    default:
      console.error('BAD CONFIG ERROR')
      return false;
  }
  router.resetConfig(newRoutes);
  return router.parseUrl(path);
}