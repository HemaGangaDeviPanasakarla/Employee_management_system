export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role?: string;
}

export interface Task {
  id: number;
  employee_id: number;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  due_date: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'Present' | 'Late' | 'Half Day' | 'WFH';
  work_hours: string;
}

export interface LeaveRecord {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DashboardStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  attendance_rate: number;
  total_present_days: number;
  total_leave_balance: number;
  leaves_used: number;
  leaves_pending: number;
}

export interface DashboardSummary {
  employee: Employee;
  stats: DashboardStats;
  recent_tasks: Task[];
  today_attendance: AttendanceRecord | null;
}
