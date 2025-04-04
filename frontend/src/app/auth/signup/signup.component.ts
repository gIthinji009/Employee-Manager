import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthResponse } from '../auth-response.interface';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user = { username: '', password: '', role: 'USER' };
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.signUp(this.user).subscribe({
        next: (res: AuthResponse) => {
          // Optionally auto-login after signup
          // this.authService.storeToken(res.token);
          // this.router.navigate(['/employees']);
          
          // Or redirect to login page
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'true' } 
          });
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}