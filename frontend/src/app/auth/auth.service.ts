import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, combineLatest } from 'rxjs';
import { catchError, tap, finalize, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  username?: string;
  roles?: string[];
  message?: string;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  
  private authStatus = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private currentRolesSubject = new BehaviorSubject<string[]>([]);
  private currentUsernameSubject = new BehaviorSubject<string>('');
  public redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    this.initializeAuthState();
  }

  // Public observables
  public currentRoles$ = this.currentRolesSubject.asObservable();
  public currentUsername$ = this.currentUsernameSubject.asObservable();
  public isLoading$ = this.loadingSubject.asObservable();
  public isAuthenticated$ = combineLatest([
    this.authStatus, 
    this.currentRoles$
  ]).pipe(
    map(([isLoggedIn, roles]) => isLoggedIn && roles.length > 0)
  );

  // Public methods
  login(credentials: { username: string, password: string }): Observable<AuthResponse> {
    this.setLoading(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  register(userData: { username: string, password: string, role?: string }): Observable<AuthResponse> {
    this.setLoading(true);
    const payload = { ...userData, role: userData.role || 'USER' };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  signUp = this.register; // Alias for register

  logout(redirect: boolean = true): void {
    this.clearAuthData();
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout(false);
      return throwError(() => new Error('No refresh token available'));
    }

    this.setLoading(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.logout(false);
        return this.handleAuthError(error);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  get currentRoles(): string[] {
    return this.currentRolesSubject.value;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }

  hasRole(requiredRole: string): boolean {
    return this.currentRoles.includes(requiredRole);
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    return requiredRoles.some(role => this.hasRole(role));
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Private methods
  private initializeAuthState(): void {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.decodeAndStoreTokenData(token);
      this.authStatus.next(true);
    } else {
      this.clearAuthData();
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      this.decodeAndStoreTokenData(response.token);
      this.authStatus.next(true);
    }
    
    if (response.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    }
    
    if (response.username) {
      this.currentUsernameSubject.next(response.username);
    }
  }

  private decodeAndStoreTokenData(token: string): void {
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      const roles = decoded?.roles || [];
      const username = decoded?.sub || '';
      
      this.currentRolesSubject.next(Array.isArray(roles) ? roles : [roles]);
      this.currentUsernameSubject.next(username);
    } catch (e) {
      console.error('Token decoding error:', e);
      this.clearAuthData();
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.authStatus.next(false);
    this.currentRolesSubject.next([]);
    this.currentUsernameSubject.next('');
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Authentication failed';
    
    if (error.status === 0) {
      errorMessage = 'Network error - unable to connect to server';
    } else if (error.status === 401) {
      errorMessage = error.error?.message || 'Invalid credentials';
    } else if (error.status === 403) {
      errorMessage = 'Access denied - insufficient permissions';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  private setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }
}