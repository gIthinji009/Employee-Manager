import { Component, OnInit } from '@angular/core';
import { Employee } from '../app/employees/employee.model';
import { EmployeeService } from '../app/employees/employee.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from './auth/auth.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Employee Management System';
  public employees: Employee[] = [];
  public filteredEmployees: Employee[] = [];
  public editEmployee: Employee | null = null;
  public deleteEmployee: Employee | null = null;
  public searchKey: string = '';
  public isLoading = true;
  public errorMessage: string | null = null;

  public isAdmin = false;
  public isUser = false;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentRoles$.subscribe(roles => {
      this.isAdmin = roles.includes('ROLE_ADMIN');
      this.isUser = roles.includes('ROLE_USER');
    });
    this.checkAuthAndLoadData();
  }

  private checkAuthAndLoadData(): void {
    if (!this.authService.isLoggedIn()) {
      this.authService.redirectToLogin();
      return;
    }
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees;
        this.filteredEmployees = [...employees];
        this.isLoading = false;
        
        if (employees.length === 0) {
          this.errorMessage = 'The employee database is currently empty.';
        }
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.error('Error loading employees:', error);
      }
    });
  }

  public onAddEmployee(addForm: NgForm): void {
    if (addForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.addEmployee(addForm.value).subscribe({
      next: () => {
        this.loadEmployees();
        addForm.reset();
        this.closeModal('addEmployeeModal');
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  public onUpdateEmployee(employee: Employee): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.updateEmployee(employee).subscribe({
      next: () => {
        this.loadEmployees();
        this.closeModal('updateEmployeeModal');
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  public onDeleteEmployee(employeeId: number | undefined): void {
    if (employeeId === undefined) {
      this.errorMessage = "Error: Employee ID is missing.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: () => {
        this.loadEmployees();
        this.closeModal('deleteEmployeeModal');
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  public searchEmployees(): void {
    if (!this.searchKey) {
      this.filteredEmployees = [...this.employees];
      return;
    }
    
    const searchTerm = this.searchKey.toLowerCase();
    this.filteredEmployees = this.employees.filter(employee => {
      return (
        (employee.name?.toLowerCase().includes(searchTerm)) ||
        (employee.email?.toLowerCase().includes(searchTerm)) ||
        (employee.phone?.toLowerCase().includes(searchTerm)) ||
        (employee.jobTitle?.toLowerCase().includes(searchTerm))
      );
    });
  }

  private closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
      }
    }
  }

  public onOpenModal(employee: Employee | null, mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');

    if (mode === 'add') {
      button.setAttribute('data-target', '#addEmployeeModal');
    } else if (mode === 'edit') {
      this.editEmployee = employee;
      button.setAttribute('data-target', '#updateEmployeeModal');
    } else if (mode === 'delete') {
      this.deleteEmployee = employee;
      button.setAttribute('data-target', '#deleteEmployeeModal');
    }

    container?.appendChild(button);
    button.click();
  }
}