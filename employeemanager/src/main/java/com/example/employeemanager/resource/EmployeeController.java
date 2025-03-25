//package com.example.employeemanager.resource;
//
//import com.example.employeemanager.model.Employee;
//import com.example.employeemanager.service.EmployeeService;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.server.ResponseStatusException;
//
//@RestController
//@RequestMapping("/employee")
//public class EmployeeController {
//
//    private final EmployeeService employeeService;
//
//    // Constructor injection
//    public EmployeeController(EmployeeService employeeService) {
//        this.employeeService = employeeService;
//    }
//
//    @PutMapping("/update")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Employee> updateEmployee(@RequestBody Employee employee) {
//        Employee existingEmployee = employeeService.findEmployeeById(employee.getId())
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
//
//        // Prevent modifying verified employees
//        if ("verified".equalsIgnoreCase(existingEmployee.getStatus())) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Verified employees cannot be modified");
//        }
//
//        return ResponseEntity.ok(employeeService.updateEmployee(employee));
//    }
//
//    @DeleteMapping("/delete/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
//        Employee employee = employeeService.findEmployeeById(id)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
//
//        // Prevent deleting verified employees
//        if ("verified".equalsIgnoreCase(employee.getStatus())) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Verified employees cannot be deleted");
//        }
//
//        employeeService.deleteEmployee(id);
//        return ResponseEntity.noContent().build();
//    }
//}