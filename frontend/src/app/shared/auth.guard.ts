import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';
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
  ): Observable<boolean | UrlTree> {
    const requiredRoles = this.getRequiredRoles(next);
    const requiresAuth = this.requiresAuthentication(next);

    if (!requiresAuth) {
      return of(true);
    }

    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          return this.createLoginRedirect(state.url);
        }

        if (requiredRoles.length > 0 && !this.hasRequiredRoles(requiredRoles)) {
          return this.createUnauthorizedRedirect(requiredRoles);
        }

        return true;
      }),
      catchError(() => of(this.createLoginRedirect(state.url)))
    );
  }

  private getRequiredRoles(route: ActivatedRouteSnapshot): string[] {
    const roles: string[] = [];
    let currentRoute: ActivatedRouteSnapshot | null = route;

    while (currentRoute) {
      if (currentRoute.data['roles']) {
        roles.push(...currentRoute.data['roles']);
      }
      currentRoute = currentRoute.parent;
    }

    return [...new Set(roles)];
  }

  private requiresAuthentication(route: ActivatedRouteSnapshot): boolean {
    let currentRoute: ActivatedRouteSnapshot | null = route;
    while (currentRoute) {
      if (currentRoute.data['requiresLogin'] === false) {
        return false;
      }
      currentRoute = currentRoute.parent;
    }
    return true;
  }

  private hasRequiredRoles(requiredRoles: string[]): boolean {
    return requiredRoles.some(role => this.authService.hasRole(role));
  }

  private createLoginRedirect(returnUrl: string): UrlTree {
    return this.router.createUrlTree(['/login'], {
      queryParams: { 
        returnUrl,
        reason: 'authentication-required'
      }
    });
  }

  private createUnauthorizedRedirect(requiredRoles: string[]): UrlTree {
    return this.router.createUrlTree(['/unauthorized'], {
      queryParams: {
        requiredRoles: requiredRoles.join(','),
        actualRoles: this.authService.currentRoles.join(',')
      }
    });
  }
}