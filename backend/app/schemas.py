"""
File: backend/app/schemas.py
Purpose: Pydantic schemas for data validation and Swagger UI documentation.
Covers Authentication, Employee Dashboard, Timesheet, Tasks, Attendance, My Leaves, and Manager My Team modules.
"""

from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional, List, Dict, Any


# ---------------- Employee & Auth Schemas ---------------- #
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, json_schema_extra={"example": "Jane Doe"})
    email: EmailStr = Field(..., json_schema_extra={"example": "jane.doe@company.com"})
    password: str = Field(..., min_length=4, json_schema_extra={"example": "********"})
    confirm_password: Optional[str] = Field(None, json_schema_extra={"example": "********"})
    role: str = Field("Employee", json_schema_extra={"example": "Employee"})  # "Employee" or "Manager"
    department: Optional[str] = Field("Engineering", json_schema_extra={"example": "Frontend"})
    designation: Optional[str] = Field(None, json_schema_extra={"example": "Frontend Developer"})
    project_name: Optional[str] = Field(None, json_schema_extra={"example": "Customer Portal"})


class LoginRequest(BaseModel):
    email: str = Field(..., json_schema_extra={"example": "user@company.com"})
    password: Optional[str] = Field(None, json_schema_extra={"example": "********"})


class EmployeeCreate(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Jane Doe"})
    email: str = Field(..., json_schema_extra={"example": "jane.doe@company.com"})
    password: Optional[str] = None
    department: str = Field("Engineering", json_schema_extra={"example": "Frontend"})
    role: Optional[str] = Field("Employee", json_schema_extra={"example": "Employee"})
    designation: Optional[str] = Field("Developer", json_schema_extra={"example": "Senior Frontend Developer"})
    manager_id: Optional[int] = None
    project_name: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    department: str
    role: str = "Employee"
    designation: str = "Employee"
    manager_id: Optional[int] = None
    project_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ---------------- Timesheet Schemas ---------------- #
class TimesheetCreate(BaseModel):
    date: str = Field(..., json_schema_extra={"example": "2026-11-24"})
    project_name: str = Field(..., json_schema_extra={"example": "Internal Portal"})
    work_description: str = Field(..., json_schema_extra={"example": "Implemented responsive employee task dashboard"})
    hours_worked: str = Field("8.0", json_schema_extra={"example": "8.0"})


class TimesheetUpdate(BaseModel):
    date: Optional[str] = None
    project_name: Optional[str] = None
    work_description: Optional[str] = None
    hours_worked: Optional[str] = None


class TimesheetResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    date: str
    project_name: str
    work_description: str
    hours_worked: str
    created_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ---------------- Project Schemas ---------------- #
class ProjectCreate(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Internal Portal"})
    description: Optional[str] = Field("", json_schema_extra={"example": "Migrating to modern responsive design and micro-frontends"})
    department: str = Field("All", json_schema_extra={"example": "Frontend"})
    status: str = Field("In Progress", json_schema_extra={"example": "In Progress"})
    progress: int = Field(65, json_schema_extra={"example": 65})
    start_date: str = Field(..., json_schema_extra={"example": "2026-10-01"})
    due_date: str = Field(..., json_schema_extra={"example": "2026-12-15"})
    manager_id: Optional[int] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    manager_id: Optional[int] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = ""
    department: str
    status: str
    progress: int
    start_date: str
    due_date: str
    manager_id: Optional[int] = None
    team_members_count: int = 0
    team_members: List[EmployeeResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ---------------- Task Schemas ---------------- #
class TaskCreate(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Implement User Profile Component"})
    description: Optional[str] = Field("", json_schema_extra={"example": "Build responsive React component with Tailwind CSS"})
    priority: str = Field("Medium", json_schema_extra={"example": "High"})  # High, Medium, Low
    due_date: str = Field(..., json_schema_extra={"example": "2026-11-28"})
    assigned_date: Optional[str] = Field(None, json_schema_extra={"example": "2026-11-24"})
    employee_id: Optional[int] = Field(None, json_schema_extra={"example": 2})
    project_name: Optional[str] = Field("General", json_schema_extra={"example": "Internal Portal"})
    project_id: Optional[int] = None
    assigned_by_role: Optional[str] = Field("Self", json_schema_extra={"example": "Manager"})
    created_by_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    project_name: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "Completed"})  # Pending, In Progress, Completed


class TaskResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_department: Optional[str] = None
    created_by_id: Optional[int] = None
    created_by_name: Optional[str] = None
    assigned_by_role: str = "Self"
    project_id: Optional[int] = None
    project_name: Optional[str] = "General"
    title: str
    description: Optional[str] = ""
    priority: str
    status: str
    assigned_date: Optional[str] = None
    due_date: str
    model_config = ConfigDict(from_attributes=True)


# ---------------- Daily Work Report Schemas (Compatibility) ---------------- #
class DailyWorkReportCreate(BaseModel):
    date: str = Field(..., json_schema_extra={"example": "2026-11-21"})
    tasks_summary: str = Field(..., json_schema_extra={"example": "Completed login authorization tests and refactored API client"})
    hours_worked: str = Field("8.0 hrs", json_schema_extra={"example": "8.0 hrs"})
    blockers: Optional[str] = Field("", json_schema_extra={"example": "None, awaiting staging DB migration"})


class DailyWorkReportReview(BaseModel):
    manager_feedback: str = Field(..., json_schema_extra={"example": "Great work on the auth tests. Keep it up!"})
    status: str = Field("Reviewed", json_schema_extra={"example": "Reviewed"})


class DailyWorkReportResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_department: Optional[str] = None
    employee_designation: Optional[str] = None
    date: str
    tasks_summary: str
    hours_worked: str
    blockers: Optional[str] = ""
    status: str
    manager_feedback: Optional[str] = ""
    created_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ---------------- Attendance Schemas ---------------- #
class AttendanceCreate(BaseModel):
    date: str = Field(..., json_schema_extra={"example": "2026-11-21"})
    check_in: Optional[str] = Field("09:00 AM", json_schema_extra={"example": "09:00 AM"})
    check_out: Optional[str] = Field("05:30 PM", json_schema_extra={"example": "05:30 PM"})
    status: str = Field("Present", json_schema_extra={"example": "Present"})
    work_hours: str = Field("8.5 hrs", json_schema_extra={"example": "8.5 hrs"})


class ClockInRequest(BaseModel):
    date: Optional[str] = Field(None, json_schema_extra={"example": "2026-11-21"})
    time: Optional[str] = Field(None, json_schema_extra={"example": "09:00 AM"})


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    department: Optional[str] = None
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: str
    work_hours: str
    model_config = ConfigDict(from_attributes=True)


# ---------------- Leave Schemas ---------------- #
class LeaveCreate(BaseModel):
    leave_type: str = Field(..., json_schema_extra={"example": "Casual Leave"})
    start_date: str = Field(..., json_schema_extra={"example": "2026-11-25"})
    end_date: str = Field(..., json_schema_extra={"example": "2026-11-26"})
    days: int = Field(2, json_schema_extra={"example": 2})
    reason: str = Field(..., json_schema_extra={"example": "Family function in hometown"})


class LeaveStatusUpdate(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "Approved"})


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    department: Optional[str] = None
    leave_type: str
    start_date: str
    end_date: str
    days: int
    reason: str
    status: str
    model_config = ConfigDict(from_attributes=True)


# ---------------- Personal Dashboard Summary Schema ---------------- #
class DashboardStats(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    manager_assigned_tasks: int = 0
    self_created_tasks: int = 0
    attendance_rate: int = 100
    total_present_days: int = 0
    total_leave_balance: int = 24
    leaves_used: int = 0
    leaves_pending: int = 0
    timesheets_count: int = 0
    reports_submitted: int = 0


class DashboardSummaryResponse(BaseModel):
    employee: EmployeeResponse
    stats: DashboardStats
    recent_tasks: List[TaskResponse]
    today_attendance: Optional[AttendanceResponse] = None
    recent_timesheets: List[TimesheetResponse] = []
    recent_reports: List[DailyWorkReportResponse] = []


# ---------------- My Team & Manager Dashboard Schemas ---------------- #
class TeamMemberItem(BaseModel):
    id: int
    name: str
    email: str
    role: str
    project_name: str
    task_summary: str
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int


class IndividualMemberDetailResponse(BaseModel):
    employee: EmployeeResponse
    assigned_project: str
    stats: Dict[str, int]  # total_tasks, completed_tasks, in_progress_tasks, pending_tasks
    tasks: List[TaskResponse]
    leaves: List[LeaveResponse]


class TeamOverview(BaseModel):
    department: str
    lead_title: str
    headcount: int
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    completion_rate: int


class EmployeePerformance(BaseModel):
    employee: EmployeeResponse
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    completion_rate: int
    attendance_status_today: str
    reports_count: int
    performance_score: int


class ManagerStats(BaseModel):
    total_team_members: int
    total_projects: int
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    overall_completion_rate: int
    overall_performance_score: int
    today_present_count: int
    today_attendance_rate: int
    pending_leave_requests: int
    reports_submitted_today: int


class ManagerDashboardResponse(BaseModel):
    manager: EmployeeResponse
    stats: ManagerStats
    projects: List[ProjectResponse]
    team_overview: List[TeamOverview]
    employee_performances: List[EmployeePerformance]
    recent_work_reports: List[DailyWorkReportResponse]
    recent_tasks: List[TaskResponse]
