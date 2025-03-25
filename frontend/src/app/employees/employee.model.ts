export interface Employee {
    id?: number;
    name: string;
    email: string;
    jobTitle: string;
    phone: string;
    imageUrl: string;
    employeeCode?: string;
    status: 'pending' | 'approved' | 'rejected';
  }
  
  export interface EmployeeResponse {
    content: Employee[];
    totalElements: number;
  }