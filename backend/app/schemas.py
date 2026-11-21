"""
File: backend/app/schemas.py
Purpose: Pydantic schemas for data validation and Swagger UI documentation.
"""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List


# ---------------- Employee Schemas ---------------- #
class EmployeeCreate(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Hema"})
    email: str = Field(..., json_schema_extra={"example": "h@gmail.com"})
    department: str = Field(..., json_schema_extra={"example": "Human Resources"})
    role: Optional[str] = Field("HR Specialist", json_schema_extra={"example": "HR Specialist"})


class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    department: str
    role: Optional[str] = "Employee"
    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: str = Field(..., json_schema_extra={"example": "h@gmail.com"})


# ---------------- Task Schemas ---------------- #
class TaskCreate(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Prepare Q4 HR Compliance Report"})
    description: Optional[str] = Field("", json_schema_extra={"example": "Review all compliance documentation and submit to audit"})
    priority: str = Field("Medium", json_schema_extra={"example": "High"})  # High, Medium, Low
    due_date: str = Field(..., json_schema_extra={"example": "2026-11-25"})


class TaskStatusUpdate(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "Completed"})  # Pending, In Progress, Completed


class TaskResponse(BaseModel):
    id: int
    employee_id: int
    title: str
    description: Optional[str] = ""
    priority: str
    status: str
    due_date: str
    model_config = ConfigDict(from_attributes=True)


# ---------------- Attendance Schemas ---------------- #
class AttendanceCreate(BaseModel):
    date: str = Field(..., json_schema_extra={"example": "2026-11-21"})
    check_in: Optional[str] = Field("09:00 AM", json_schema_extra={"example": "09:00 AM"})
    check_out: Optional[str] = Field("05:30 PM", json_schema_extra={"example": "05:30 PM"})
    status: str = Field("Present", json_schema_extra={"example": "Present"})  # Present, Late, Half Day, WFH
    work_hours: str = Field("8.5 hrs", json_schema_extra={"example": "8.5 hrs"})


class ClockInRequest(BaseModel):
    date: Optional[str] = Field(None, json_schema_extra={"example": "2026-11-21"})
    time: Optional[str] = Field(None, json_schema_extra={"example": "09:00 AM"})


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: str
    work_hours: str
    model_config = ConfigDict(from_attributes=True)


# ---------------- Leave Schemas ---------------- #
class LeaveCreate(BaseModel):
    leave_type: str = Field(..., json_schema_extra={"example": "Casual Leave"})  # Casual Leave, Sick Leave, Annual Leave
    start_date: str = Field(..., json_schema_extra={"example": "2026-11-25"})
    end_date: str = Field(..., json_schema_extra={"example": "2026-11-26"})
    days: int = Field(2, json_schema_extra={"example": 2})
    reason: str = Field(..., json_schema_extra={"example": "Family function in hometown"})


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: str
    end_date: str
    days: int
    reason: str
    status: str
    model_config = ConfigDict(from_attributes=True)


# ---------------- Dashboard Summary Schema ---------------- #
class DashboardStats(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    attendance_rate: int
    total_present_days: int
    total_leave_balance: int
    leaves_used: int
    leaves_pending: int


class DashboardSummaryResponse(BaseModel):
    employee: EmployeeResponse
    stats: DashboardStats
    recent_tasks: List[TaskResponse]
    today_attendance: Optional[AttendanceResponse] = None
