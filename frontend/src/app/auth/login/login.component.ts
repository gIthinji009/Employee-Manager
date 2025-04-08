import { Component } from '@angular/core';
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
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  

  

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.errorMessage = '';
  
      this.authService.login(this.credentials)
        .pipe(finalize(() => form.resetForm()))
        .subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/employees';
            this.router.navigateByUrl(returnUrl);
          },
          error: (err: Error) => {
            this.errorMessage = err.message;
            console.error('Login error:', err);
          }
        });
    }
  }


}