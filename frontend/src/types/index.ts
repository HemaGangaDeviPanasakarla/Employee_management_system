export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: 'Manager' | 'Employee' | string;
  designation?: string;
  manager_id?: number | null;
  project_name?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm_password?: string;
  role: 'Employee' | 'Manager';
  department?: string;
  designation?: string;
}

export interface Timesheet {
  id: number;
  employee_id: number;
  employee_name?: string;
  date: string;
  project_name: string;
  work_description: string;
  hours_worked: string;
  created_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  department: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | string;
  progress: number;
  start_date: string;
  due_date: string;
  manager_id?: number;
  team_members_count?: number;
  team_members?: Employee[];
}

export interface Task {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_department?: string;
  created_by_id?: number;
  created_by_name?: string;
  assigned_by_role: 'Manager' | 'Self' | string;
  project_id?: number;
  project_name?: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low' | string;
  status: 'Pending' | 'In Progress' | 'Completed' | string;
  assigned_date?: string;
  due_date: string;
}

export interface DailyWorkReport {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_department?: string;
  employee_designation?: string;
  date: string;
  tasks_summary: string;
  hours_worked: string;
  blockers?: string;
  status: 'Submitted' | 'Reviewed' | 'Approved';
  manager_feedback?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name?: string;
  department?: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'Present' | 'Late' | 'Half Day' | 'WFH' | string;
  work_hours: string;
}

export interface LeaveRecord {
  id: number;
  employee_id: number;
  employee_name?: string;
  department?: string;
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
  manager_assigned_tasks: number;
  self_created_tasks: number;
  attendance_rate: number;
  total_present_days: number;
  total_leave_balance: number;
  leaves_used: number;
  leaves_pending: number;
  timesheets_count?: number;
  reports_submitted?: number;
}

export interface DashboardSummary {
  employee: Employee;
  stats: DashboardStats;
  recent_tasks: Task[];
  today_attendance: AttendanceRecord | null;
  recent_timesheets?: Timesheet[];
  recent_reports?: DailyWorkReport[];
}

export interface TeamMemberItem {
  id: number;
  name: string;
  email: string;
  role: string;
  project_name: string;
  task_summary: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
}

export interface IndividualMemberDetail {
  employee: Employee;
  assigned_project: string;
  stats: {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    pending_tasks: number;
  };
  tasks: Task[];
  leaves: LeaveRecord[];
}

export interface TeamOverview {
  department: string;
  lead_title: string;
  headcount: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  completion_rate: number;
}

export interface EmployeePerformance {
  employee: Employee;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  completion_rate: number;
  attendance_status_today: string;
  reports_count: number;
  performance_score: number;
}

export interface ManagerStats {
  total_team_members: number;
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  overall_completion_rate: number;
  overall_performance_score: number;
  today_present_count: number;
  today_attendance_rate: number;
  pending_leave_requests: number;
  reports_submitted_today: number;
}

export interface ManagerDashboardSummary {
  manager: Employee;
  stats: ManagerStats;
  projects: Project[];
  team_overview: TeamOverview[];
  employee_performances: EmployeePerformance[];
  recent_work_reports: DailyWorkReport[];
  recent_tasks: Task[];
}
