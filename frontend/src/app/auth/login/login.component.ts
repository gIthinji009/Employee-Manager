import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: any) {
    if (form.valid) {
      this.isLoading = true;
      this.authService.signIn(this.credentials).subscribe({
        next: (res) => {
          this.authService.storeToken(res.token);
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Login failed';
          this.isLoading = false;
        },
        complete: () => this.isLoading = false
      });
    }
  }
}