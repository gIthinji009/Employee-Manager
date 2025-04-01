import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(!!this.getToken());
  private currentUserRoles = new BehaviorSubject<string[]>(this.getUserRolesFromToken());
  
  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService) {}

  signUp(user: {username: string, password: string, role?: string}): Observable<any> {
    return this.register(user);
  }

  signIn(credentials: {username: string, password: string}): Observable<any> {
    return this.login(credentials);
  }

  login(credentials: {username: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.storeToken(response.token);
        this.loggedIn.next(true);
        this.currentUserRoles.next(this.getUserRolesFromToken());
      })
    );
  }

  register(user: {username: string, password: string, role?: string}): Observable<any> {
    const userWithRole = { ...user, role: user.role || 'USER' };
    return this.http.post(`${this.apiUrl}/register`, userWithRole);
  }

  logout(): void {
    this.removeToken();
    this.loggedIn.next(false);
    this.currentUserRoles.next([]);
    this.router.navigate(['/login']);
  }

  storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get isUserLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getUserRoles(): Observable<string[]> {
    return this.currentUserRoles.asObservable();
  }

  getCurrentUserRoles(): string[] {
    return this.currentUserRoles.value;
  }

  hasRole(role: string): boolean {
    return this.currentUserRoles.value.includes(role);
  }

  private getUserRolesFromToken(): string[] {
    const token = this.getToken();
    if (!token) return [];
    
    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.roles || [];
    } catch (e) {
      console.error('Error decoding token', e);
      return [];
    }
  }
}