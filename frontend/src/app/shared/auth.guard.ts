import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    const requiredRoles = next.data['roles'] as Array<string>;
    
    if (this.authService.getToken()) {
      // If no specific roles required, just check authentication
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
      
      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => 
        this.authService.hasRole(role)
      );
      
      if (hasRequiredRole) {
        return true;
      }
      
      // User doesn't have required role
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // Not logged in - redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}