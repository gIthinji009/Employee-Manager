import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Employee } from '../employees/employee.model';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/employee';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    try {
      const token = this.authService.getToken();
      
      if (!token || this.authService.isTokenExpired(token)) {
        this.handleAuthError();
        throw new Error('Invalid or expired token');
      }

      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    } catch (error) {
      this.handleAuthError();
      throw error;
    }
  }

  private handleAuthError(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401 || error.status === 403) {
      this.handleAuthError();
      return throwError(() => new Error('Session expired. Please login again.'));
    }
    
    // Handle specific error messages from server if available
    const errorMessage = error.error?.message || 'Something went wrong. Please try again later.';
    return throwError(() => new Error(errorMessage));
  }

  // Wrapper method to handle auth and errors consistently
  private request<T>(method: string, url: string, body?: any): Observable<T> {
    return this.http.request<T>(method, url, {
      body,
      headers: this.getHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // API methods
  getAllEmployees(): Observable<Employee[]> {
    return this.request<Employee[]>('GET', `${this.apiUrl}/all`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.request<Employee>('GET', `${this.apiUrl}/find/${id}`);
  }

  addEmployee(employee: Employee): Observable<Employee> {
    return this.request<Employee>('POST', `${this.apiUrl}/add`, employee);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return this.request<Employee>('PUT', `${this.apiUrl}/update`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.request<void>('DELETE', `${this.apiUrl}/delete/${id}`);
  }
}