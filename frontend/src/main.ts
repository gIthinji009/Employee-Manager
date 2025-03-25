import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { jwtInterceptor } from './app/shared/jwt.interceptor'; // Changed to functional interceptor
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    
    provideHttpClient(withInterceptors([jwtInterceptor])),
    
    
    provideRouter(routes),
    
    
    importProvidersFrom(FormsModule)
  ]
}).catch(err => console.error(err));