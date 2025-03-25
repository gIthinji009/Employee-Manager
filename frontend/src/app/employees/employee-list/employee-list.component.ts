import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  statusFilter = 'all';
  isLoading = true;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading employees', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.statusFilter === 'all') {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(
        emp => emp.status?.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }
  }

  deleteEmployee(id?: number): void {
    if (id === undefined) {
      console.error('Cannot delete employee: ID is undefined');
      return;
    }

    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => this.loadEmployees(),
        error: (err) => console.error('Error deleting employee', err)
      });
    }
  }
}