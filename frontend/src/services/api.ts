import axios from 'axios';
import type {
  Employee,
  Task,
  AttendanceRecord,
  LeaveRecord,
  DashboardSummary,
} from '../types';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Authentication & Employees
  async login(email: string): Promise<Employee> {
    const response = await API.post<Employee>('/login', { email });
    return response.data;
  },

  async getAllEmployees(): Promise<Employee[]> {
    const response = await API.get<Employee[]>('/employees');
    return response.data;
  },

  async getEmployeeById(id: number): Promise<Employee> {
    const response = await API.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  // Dashboard
  async getDashboardSummary(employeeId: number): Promise<DashboardSummary> {
    const response = await API.get<DashboardSummary>(
      `/employees/${employeeId}/dashboard-summary`
    );
    return response.data;
  },

  // Tasks
  async getTasks(employeeId: number, status?: string): Promise<Task[]> {
    const params = status && status !== 'All' ? { status_filter: status } : {};
    const response = await API.get<Task[]>(`/employees/${employeeId}/tasks`, {
      params,
    });
    return response.data;
  },

  async createTask(
    employeeId: number,
    task: { title: string; description: string; priority: string; due_date: string }
  ): Promise<Task> {
    const response = await API.post<Task>(
      `/employees/${employeeId}/tasks`,
      task
    );
    return response.data;
  },

  async updateTaskStatus(
    taskId: number,
    status: 'Pending' | 'In Progress' | 'Completed'
  ): Promise<Task> {
    const response = await API.patch<Task>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  async deleteTask(taskId: number): Promise<void> {
    await API.delete(`/tasks/${taskId}`);
  },

  // Attendance
  async getAttendance(employeeId: number): Promise<AttendanceRecord[]> {
    const response = await API.get<AttendanceRecord[]>(
      `/employees/${employeeId}/attendance`
    );
    return response.data;
  },

  async clockIn(employeeId: number): Promise<AttendanceRecord> {
    const response = await API.post<AttendanceRecord>(
      `/employees/${employeeId}/attendance/clock-in`
    );
    return response.data;
  },

  async clockOut(employeeId: number): Promise<AttendanceRecord> {
    const response = await API.post<AttendanceRecord>(
      `/employees/${employeeId}/attendance/clock-out`
    );
    return response.data;
  },

  // Leaves
  async getLeaves(employeeId: number): Promise<LeaveRecord[]> {
    const response = await API.get<LeaveRecord[]>(
      `/employees/${employeeId}/leaves`
    );
    return response.data;
  },

  async applyLeave(
    employeeId: number,
    leave: {
      leave_type: string;
      start_date: string;
      end_date: string;
      days: number;
      reason: string;
    }
  ): Promise<LeaveRecord> {
    const response = await API.post<LeaveRecord>(
      `/employees/${employeeId}/leaves`,
      leave
    );
    return response.data;
  },
};

export default API;
