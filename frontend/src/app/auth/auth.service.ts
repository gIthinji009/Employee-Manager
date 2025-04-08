import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, combineLatest, of } from 'rxjs';
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
  private apiUrl = 'http://localhost:8080/api/auth';
  private authStatus = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private currentRolesSubject = new BehaviorSubject<string[]>([]);

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {this.authStatus.next(this.checkInitialLogin());}

  // Public properties
  public currentRoles$ = this.currentRolesSubject.asObservable();
  public get currentRoles(): string[] {
    return this.currentRolesSubject.value;
  }

  // Authentication methods
  login(credentials: {username: string, password: string}): Observable<AuthResponse> {
    this.setLoading(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  register(userData: {username: string, password: string, role?: string}): Observable<AuthResponse> {
    this.setLoading(true);
    const payload = { ...userData, role: userData.role || 'USER' };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error)),
      finalize(() => this.setLoading(false))
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authStatus.value && !this.isTokenExpired();
  }
  
  redirectToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { reason: 'not-logged-in' }
    });
  }
  
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.clearAuthData();
      return throwError(() => new Error('No refresh token found'));
    }
  
    this.setLoading(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error)),
      finalize(() => this.setLoading(false))
    );
  }
  
  signUp(userData: {username: string, password: string, role?: string}): Observable<AuthResponse> {
    return this.register(userData);
  }
  

  // Token management
  storeToken(token: string): void {
    if (!token || this.isTokenExpired(token)) {
      this.clearAuthData();
      return;
    }
    localStorage.setItem('token', token);
    this.decodeAndStoreTokenData(token);
    this.authStatus.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    return !tokenToCheck || this.jwtHelper.isTokenExpired(tokenToCheck);
  }

  // Role checking
  hasRole(requiredRole: string): boolean {
    return this.currentRoles.includes(requiredRole);
  }

  // Status observables
  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return combineLatest([this.authStatus, this.currentRoles$]).pipe(
      map(([isLoggedIn, roles]) => isLoggedIn && roles.length > 0)
    );
  }

  // Private helper methods
  private checkInitialLogin(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  private decodeAndStoreTokenData(token: string): void {
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      const roles = decoded?.roles || [];
      this.currentRolesSubject.next(Array.isArray(roles) ? roles : [roles]);
    } catch (e) {
      console.error('Token decoding error', e);
      this.currentRolesSubject.next([]);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.authStatus.next(false);
    this.currentRolesSubject.next([]);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storeToken(response.token);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Authentication failed';
    if (error.status === 0) {
      errorMessage = 'Unable to connect to server';
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 403) {
      errorMessage = 'Access denied';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    this.clearAuthData();
    return throwError(() => new Error(errorMessage));
  }

  private setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }
}