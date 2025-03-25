import { Component, OnInit } from '@angular/core';
import { Employee } from '../app/employees/employee.model';
import { EmployeeService } from '../app/employees/employee.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
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

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  public getEmployees(): void {
    this.employeeService.getAllEmployees().subscribe(
      (response: Employee[]) => {
        this.employees = response;
        this.filteredEmployees = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public onAddEmployee(addForm: NgForm): void {
    document.getElementById('add-employee-form')?.click();
    this.employeeService.addEmployee(addForm.value).subscribe(
      (response: Employee) => {
        this.getEmployees();
        addForm.reset();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        addForm.reset();
      }
    );
  }

  public onUpdateEmployee(employee: Employee): void {
    this.employeeService.updateEmployee(employee).subscribe(
      (response: Employee) => {
        this.getEmployees();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public onDeleteEmployee(employeeId: number | undefined): void {
    if (employeeId === undefined) {
      alert("Error: Employee ID is missing.");
      return;
    }
    this.employeeService.deleteEmployee(employeeId).subscribe(
      () => {
        this.getEmployees();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public searchEmployees(): void {
    if (!this.searchKey) {
      this.filteredEmployees = [...this.employees];
      return;
    }
    this.filteredEmployees = this.employees.filter(employee =>
      employee.name.toLowerCase().includes(this.searchKey.toLowerCase()) ||
      employee.email.toLowerCase().includes(this.searchKey.toLowerCase()) ||
      employee.phone.toLowerCase().includes(this.searchKey.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(this.searchKey.toLowerCase())
    );
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
