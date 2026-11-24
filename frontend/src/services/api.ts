import axios from 'axios';
import type {
  Employee,
  RegisterData,
  Timesheet,
  Project,
  Task,
  AttendanceRecord,
  LeaveRecord,
  DashboardSummary,
  TeamMemberItem,
  IndividualMemberDetail,
  ManagerDashboardSummary,
} from '../types';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Authentication & Employees
  async register(data: RegisterData): Promise<Employee> {
    const response = await API.post<Employee>('/register', data);
    return response.data;
  },

  async login(email: string, password?: string): Promise<Employee> {
    const response = await API.post<Employee>('/login', { email, password });
    return response.data;
  },

  async getAllEmployees(department?: string, role?: string): Promise<Employee[]> {
    const params: Record<string, string> = {};
    if (department && department !== 'All') params.department = department;
    if (role && role !== 'All') params.role = role;
    const response = await API.get<Employee[]>('/employees', { params });
    return response.data;
  },

  async getEmployeeById(id: number): Promise<Employee> {
    const response = await API.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  // Dashboards
  async getDashboardSummary(employeeId: number): Promise<DashboardSummary> {
    const response = await API.get<DashboardSummary>(
      `/employees/${employeeId}/dashboard-summary`
    );
    return response.data;
  },

  async getManagerDashboardSummary(managerId?: number): Promise<ManagerDashboardSummary> {
    const params = managerId ? { manager_id: managerId } : {};
    const response = await API.get<ManagerDashboardSummary>(
      '/manager/dashboard-summary',
      { params }
    );
    return response.data;
  },

  // Timesheets
  async getTimesheets(employeeId: number): Promise<Timesheet[]> {
    const response = await API.get<Timesheet[]>(
      `/employees/${employeeId}/timesheets`
    );
    return response.data;
  },

  async addTimesheet(
    employeeId: number,
    entry: {
      date: string;
      project_name: string;
      work_description: string;
      hours_worked: string;
    }
  ): Promise<Timesheet> {
    const response = await API.post<Timesheet>(
      `/employees/${employeeId}/timesheets`,
      entry
    );
    return response.data;
  },

  async updateTimesheet(
    timesheetId: number,
    entry: Partial<Timesheet>
  ): Promise<Timesheet> {
    const response = await API.put<Timesheet>(
      `/timesheets/${timesheetId}`,
      entry
    );
    return response.data;
  },

  async deleteTimesheet(timesheetId: number): Promise<void> {
    await API.delete(`/timesheets/${timesheetId}`);
  },

  // Tasks
  async getTasks(
    employeeId: number,
    status?: string,
    source?: string
  ): Promise<Task[]> {
    const params: Record<string, string> = {};
    if (status && status !== 'All') params.status_filter = status;
    if (source && source !== 'All') params.source_filter = source;
    const response = await API.get<Task[]>(`/employees/${employeeId}/tasks`, {
      params,
    });
    return response.data;
  },

  async createTask(
    employeeId: number,
    task: {
      title: string;
      description: string;
      priority: string;
      due_date: string;
      project_name?: string;
      assigned_date?: string;
    }
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

  async updateLeaveStatus(
    leaveId: number,
    status: 'Approved' | 'Rejected'
  ): Promise<LeaveRecord> {
    const response = await API.patch<LeaveRecord>(`/leaves/${leaveId}/status`, {
      status,
    });
    return response.data;
  },

  // Manager Only - My Team Module
  async getManagerProjects(managerId: number): Promise<Project[]> {
    const response = await API.get<Project[]>(`/manager/${managerId}/projects`);
    return response.data;
  },

  async getManagerTeam(managerId: number): Promise<TeamMemberItem[]> {
    const response = await API.get<TeamMemberItem[]>(`/manager/${managerId}/team`);
    return response.data;
  },

  async getIndividualMemberDetail(
    managerId: number,
    employeeId: number
  ): Promise<IndividualMemberDetail> {
    const response = await API.get<IndividualMemberDetail>(
      `/manager/${managerId}/team/${employeeId}`
    );
    return response.data;
  },

  async assignTaskToMember(
    managerId: number,
    data: {
      employee_id: number;
      project_name: string;
      title: string;
      description: string;
      assigned_date: string;
      due_date: string;
      priority: string;
    }
  ): Promise<Task> {
    const response = await API.post<Task>(
      `/manager/${managerId}/assign-task`,
      data
    );
    return response.data;
  },
};

export default API;
