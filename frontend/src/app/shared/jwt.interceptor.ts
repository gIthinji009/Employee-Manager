import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    switchMap(isAuthenticated => {
      const token = authService.getToken();

      if (token && isAuthenticated) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next(req).pipe(
        catchError(error => {
          if (error.status === 401 && !req.url.includes('/auth/refresh')) {
            // Handle 401: try refresh token
            return authService.refreshToken().pipe(
              switchMap(() => {
                const newToken = authService.getToken();
                const cloned = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(cloned);
              }),
              catchError(refreshError => {
                authService.logout();
                router.navigate(['/login'], {
                  queryParams: { reason: 'session-expired' }
                });
                return throwError(() => refreshError);
              })
            );
          }
          return throwError(() => error);
        })
      );
    })
  );
};
