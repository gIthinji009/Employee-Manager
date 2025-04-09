import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized-container">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <button routerLink="/login" class="btn btn-primary">Back to Home</button>
    </div>
  `,
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent {}