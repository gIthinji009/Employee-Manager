import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { jwtInterceptor } from './app/shared/jwt.interceptor'; // Changed to functional interceptor
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { AuthInterceptor } from '../src/app/auth.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';


bootstrapApplication(AppComponent, {
  providers: [
    
    
    provideHttpClient(withInterceptors([ jwtInterceptor])),
    
    
    provideRouter(routes),
    
    
    importProvidersFrom(FormsModule),

    { provide: JWT_OPTIONS, useValue: { tokenGetter: () => localStorage.getItem('token') } },
    JwtHelperService
  ]
}).catch(err => console.error(err));