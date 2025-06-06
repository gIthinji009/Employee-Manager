// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { EmployeeListComponent } from './employees/employee-list/employee-list.component';
import { EmployeeFormComponent } from './employees/employee-form/employee-form.component';
import { AuthGuard } from './shared/auth.guard';
import { RoleGuard } from './shared/role.guard';
import { UnauthorizedComponent } from './shared/unauthorized/unauthorized.component';

export const routes: Routes = [
  {path: '', redirectTo: 'login',pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'employees', 
    component: EmployeeListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'ADMIN'] }
  },
  { 
    path: 'employees/add', 
    component: EmployeeFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'employees/edit/:id', 
    component: EmployeeFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [ 'ADMIN'] }
  },
 
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/employees', pathMatch: 'full' },
  { path: '**', redirectTo: '/employees' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}