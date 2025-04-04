import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.checkInitialLogin());
  private currentUserRoles = new BehaviorSubject<string[]>(this.getUserRolesFromToken());
  private currentUsername = new BehaviorSubject<string>(this.getUsernameFromToken());

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private jwtHelper: JwtHelperService
  ) {}

  // Public methods
  login(credentials: {username: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.storeAuthData(response);
        this.updateAuthState();
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => this.handleAuthError(error));
      })
    );
  }

  register(user: {username: string, password: string, role?: string}): Observable<any> {
    const userWithRole = { ...user, role: user.role || 'USER' };
    return this.http.post(`${this.apiUrl}/register`, userWithRole).pipe(
      catchError(error => throwError(() => this.handleAuthError(error)))
    );
  }
  signIn(credentials: {username: string, password: string}): Observable<any> {
    return this.login(credentials); // Alias for login
  }

  signUp(user: {username: string, password: string, role?: string}): Observable<any> {
    return this.register(user); // Alias for register
  }
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }
  storeToken(token: string): void {
    localStorage.setItem('token', token);
    this.loggedIn.next(true);
    this.updateAuthState();
  }
  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh`, { 
      token: this.getToken() 
    }).pipe(
      tap((response: any) => {
        this.storeAuthData(response);
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => this.handleAuthError(error));
      })
    );
  }
  isLoggedIn(): boolean {
    return this.checkInitialLogin();
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return true;
    return this.jwtHelper.isTokenExpired(tokenToCheck);
  }

  // Getters
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get userRoles$(): Observable<string[]> {
    return this.currentUserRoles.asObservable();
  }

  get username$(): Observable<string> {
    return this.currentUsername.asObservable();
  }

  hasRole(role: string): boolean {
    return this.currentUserRoles.value.includes(role);
  }

  // Private helper methods
  private checkInitialLogin(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  private storeAuthData(response: any): void {
    localStorage.setItem('token', response.token);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.loggedIn.next(false);
    this.currentUserRoles.next([]);
    this.currentUsername.next('');
  }

  private updateAuthState(): void {
    this.loggedIn.next(true);
    this.currentUserRoles.next(this.getUserRolesFromToken());
    this.currentUsername.next(this.getUsernameFromToken());
  }

  private getUserRolesFromToken(): string[] {
    const token = this.getToken();
    if (!token) return [];
    
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded.roles || [];
    } catch (e) {
      console.error('Token decoding error', e);
      return [];
    }
  }

  private getUsernameFromToken(): string {
    const token = this.getToken();
    if (!token) return '';
    
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded.sub || decoded.username || '';
    } catch (e) {
      console.error('Token decoding error', e);
      return '';
    }
  }

  private handleAuthError(error: any): Error {
    // Custom error handling logic
    if (error.status === 401) {
      return new Error('Invalid credentials');
    }
    if (error.status === 403) {
      return new Error('Access denied');
    }
    return new Error('Authentication failed. Please try again.');
  }
}