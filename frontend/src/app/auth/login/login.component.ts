import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = { username: '', password: '' };
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'authentication-required') {
      this.errorMessage = 'Please log in to access that page.';
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.errorMessage = '';

      this.authService.login(this.credentials)
        .pipe(finalize(() => form.resetForm()))
        .subscribe({
         
          
          next: () => {
            console.log('Login');
            const roles = this.authService.currentRoles; 

            console.log('roles', roles);
          
          let redirectUrl = '/employees'; // default redirection
          if (roles.includes('ROLE_ADMIN')) {
            redirectUrl = '/employees';  
          } else if (roles.includes('ROLE_USER')) {
            redirectUrl = '/employees';
          }

        
          this.router.navigateByUrl(redirectUrl);
          },
          error: (err: Error) => {
            this.errorMessage = err.message;
            console.error('Login error:', err);
          }
        });
    }
  }
}
