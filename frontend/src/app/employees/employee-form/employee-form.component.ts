import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee.model';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employee: Employee = {
    name: '',
    email: '',
    jobTitle: '',
    phone: '',
    imageUrl: '',
    status: 'pending'
  };
  isEditMode = false;
  employeeId?: number;

  constructor(
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.params['id'];
    if (this.employeeId) {
      this.isEditMode = true;
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: number): void {
    this.employeeService.getEmployee(id).subscribe(emp => {
      this.employee = emp;
    });
  }

  onSubmit(form: any): void {
    if (form.valid) {
      const operation = this.isEditMode
        ? this.employeeService.updateEmployee({ ...this.employee, id: this.employeeId })
        : this.employeeService.addEmployee(this.employee);

      operation.subscribe({
        next: () => this.router.navigate(['/employees']),
        error: (err) => console.error('Error saving employee', err)
      });
    }
  }
}