import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private loggedIn = new BehaviorSubject<boolean>(!!this.getToken());
 
  constructor(private http: HttpClient, private router: Router) {}

  // Alias for register to match component
  signUp(user: {username: string, password: string, role?: string}): Observable<any> {
    return this.register(user);
  }

  // Alias for login to match common naming
  signIn(credentials: {username: string, password: string}): Observable<any> {
    return this.login(credentials);
  }

  login(credentials: {username: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.storeToken(response.token);
        this.loggedIn.next(true);
      })
    );
  }

  register(user: {username: string, password: string, role?: string}): Observable<any> {
    // Set default role
    const userWithRole = { ...user, role: user.role || 'USER' };
    return this.http.post(`${this.apiUrl}/register`, userWithRole);
  }

  logout(): void {
    this.removeToken();
    this.loggedIn.next(false);
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

  // Helper method to get current login status synchronously
  get isUserLoggedIn(): boolean {
    return this.loggedIn.value;
  }
}