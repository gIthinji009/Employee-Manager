import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const requiredRoles = next.data['roles'] as Array<string>;
    const requiresLogin = next.data['requiresLogin'] !== false;

    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        if (!requiresLogin) return true;

        if (!isLoggedIn) {
          return this.router.createUrlTree(
            ['/login'], 
            { queryParams: { returnUrl: state.url } }
          );
        }

        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }

        const hasRole = requiredRoles.some(role => 
          this.authService.hasRole(role)
        );

        if (!hasRole) {
          return this.router.createUrlTree(['/unauthorized']);
        }

        return true;
      })
    );
  }
}