import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  employeeId?: number;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      jobTitle: ['', Validators.required],
      phone: ['', Validators.required],
      imageUrl: [''],
      status: ['pending']
    });
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.params['id'];
    if (this.employeeId) {
      this.isEditMode = true;
      this.isLoading = true;
      this.employeeService.getEmployeeById(this.employeeId).subscribe({
        next: (employee) => {
          this.employeeForm.patchValue(employee);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.router.navigate(['/employees']);
        }
      });
    }
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      this.isLoading = true;
      const employee: Employee = this.employeeForm.value;
      
      const operation = this.isEditMode
        ? this.employeeService.updateEmployee({ ...employee, id: this.employeeId })
        : this.employeeService.addEmployee(employee);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/employees']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }
}