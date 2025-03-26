package com.example.employeemanager.resource;

import com.example.employeemanager.model.Employee;
import com.example.employeemanager.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee")
@Tag(name = "Employee Management", description = "Endpoints for managing employees")
@SecurityRequirement(name = "bearerAuth")
public class EmployeeResource {
    private final EmployeeService employeeService;

    public EmployeeResource(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @Operation(summary = "Get all employees", description = "Returns a list of all employees")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list",
            content = @Content(schema = @Schema(implementation = Employee.class)))
    @GetMapping("/all")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeService.findAllEmployees();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @Operation(summary = "Get employee by ID", description = "Returns a single employee by their ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Employee found",
                    content = @Content(schema = @Schema(implementation = Employee.class))),
            @ApiResponse(responseCode = "404", description = "Employee not found")
    })
    @GetMapping("/find/{id}")
    public ResponseEntity<Employee> getEmployeeById(
            @Parameter(name = "id", description = "ID of the employee to find", required = true, in = ParameterIn.PATH)
            @PathVariable("id") Long id) {
        Employee employee = employeeService.findEmployeeById(id);
        return new ResponseEntity<>(employee, HttpStatus.OK);
    }

    @Operation(summary = "Get employees by status", description = "Returns employees filtered by status")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered list",
            content = @Content(schema = @Schema(implementation = Employee.class)))
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Employee>> getEmployeesByStatus(
            @Parameter(name = "status", description = "Status to filter by (ACTIVE/INACTIVE)", required = true)
            @PathVariable("status") String status) {
        List<Employee> employees = employeeService.findEmployeesByStatus(status);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @Operation(summary = "Add a new employee", description = "Creates a new employee record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Employee created successfully",
                    content = @Content(schema = @Schema(implementation = Employee.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping("/add")
    public ResponseEntity<Employee> addEmployee(
            @Parameter(description = "Employee object to be added", required = true)
            @RequestBody Employee employee) {
        Employee newEmployee = employeeService.addEmployee(employee);
        return new ResponseEntity<>(newEmployee, HttpStatus.CREATED);
    }

    @Operation(summary = "Update employee", description = "Updates an existing employee record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Employee updated successfully",
                    content = @Content(schema = @Schema(implementation = Employee.class))),
            @ApiResponse(responseCode = "404", description = "Employee not found")
    })
    @PutMapping("/update")
    public ResponseEntity<Employee> updateEmployee(
            @Parameter(description = "Employee object with updated information", required = true)
            @RequestBody Employee employee) {
        Employee updateEmployee = employeeService.updateEmployee(employee);
        return new ResponseEntity<>(updateEmployee, HttpStatus.OK);
    }

    @Operation(summary = "Delete employee", description = "Deletes an employee by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Employee deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Employee not found")
    })
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEmployee(
            @Parameter(name = "id", description = "ID of the employee to delete", required = true)
            @PathVariable("id") Long id) {
        employeeService.deleteEmployee(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}