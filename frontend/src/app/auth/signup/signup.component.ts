import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

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

  onSubmit(form: any) {
    if (form.valid) {
      this.isLoading = true;
      this.authService.signUp(this.user).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Signup failed';
          this.isLoading = false;
        },
        complete: () => this.isLoading = false
      });
    }
  }
}