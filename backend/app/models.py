"""
File: backend/app/models.py
Purpose: Defines SQLAlchemy ORM database models for Employee and Manager Management System.
Hierarchy:
  Manager -> Employees (assigned to manager's team and projects)
Models:
  - Employee: Company employees and managers, role-based authentication and team associations.
  - Project: Team projects managed by managers, with associated members and milestone progress.
  - Task: Tasks with self-assigned vs manager-assigned tracking, due dates, and statuses.
  - Timesheet: Daily timesheet entries with project, work description, and hours worked.
  - DailyWorkReport: Daily logs maintained for backwards compatibility.
  - Attendance: Daily clock-in/clock-out attendance records with validation against duplicates.
  - Leave: Leave applications with approval statuses and balance tracking.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship

try:
    from app.database import Base
except ImportError:
    from database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=True)  # Hashed password for authentication
    department = Column(String, default="Engineering")  # Frontend, Backend, Testing, Management, etc.
    role = Column(String, default="Employee")  # "Manager" or "Employee"
    designation = Column(String, default="Employee")  # "Senior Frontend Developer", "Engineering Manager", etc.
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    project_name = Column(String, nullable=True, default=None)

    # Relationships
    tasks = relationship("Task", foreign_keys="[Task.employee_id]", back_populates="employee", cascade="all, delete-orphan")
    created_tasks = relationship("Task", foreign_keys="[Task.created_by_id]", back_populates="creator")
    timesheets = relationship("Timesheet", back_populates="employee", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leaves = relationship("Leave", back_populates="employee", cascade="all, delete-orphan")
    work_reports = relationship("DailyWorkReport", back_populates="employee", cascade="all, delete-orphan")
    projects_managed = relationship("Project", back_populates="manager")
    team_members = relationship("Employee", backref="manager", remote_side=[id])


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String, default="All")   # All, Frontend, Backend, Testing, etc.
    status = Column(String, default="In Progress")  # Planning, In Progress, Completed, On Hold
    progress = Column(Integer, default=0)        # 0 to 100 percentage
    start_date = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)

    # Relationships
    tasks = relationship("Task", back_populates="project")
    manager = relationship("Employee", foreign_keys=[manager_id], back_populates="projects_managed")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    assigned_by_role = Column(String, default="Self")  # "Manager" or "Self"
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    project_name = Column(String, default="General")
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="Medium")  # High, Medium, Low
    status = Column(String, default="Pending")    # Pending, In Progress, Completed
    assigned_date = Column(String, nullable=True)  # YYYY-MM-DD
    due_date = Column(String, nullable=False)

    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="tasks")
    creator = relationship("Employee", foreign_keys=[created_by_id], back_populates="created_tasks")
    project = relationship("Project", back_populates="tasks")


class Timesheet(Base):
    __tablename__ = "timesheets"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    project_name = Column(String, nullable=False)
    work_description = Column(Text, nullable=False)
    hours_worked = Column(String, default="8.0")  # e.g. "8", "8.5"
    created_at = Column(String, nullable=True)

    # Relationships
    employee = relationship("Employee", back_populates="timesheets")


class DailyWorkReport(Base):
    __tablename__ = "daily_work_reports"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(String, nullable=False)          # YYYY-MM-DD
    tasks_summary = Column(Text, nullable=False)
    hours_worked = Column(String, default="8.0 hrs")
    blockers = Column(Text, nullable=True, default="")
    status = Column(String, default="Submitted")    # Submitted, Reviewed
    manager_feedback = Column(Text, nullable=True, default="")
    created_at = Column(String, nullable=True)

    # Relationships
    employee = relationship("Employee", back_populates="work_reports")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(String, nullable=False)
    check_in = Column(String, nullable=True)
    check_out = Column(String, nullable=True)
    status = Column(String, default="Present")  # Present, Late, Half Day, WFH
    work_hours = Column(String, default="8.0 hrs")

    employee = relationship("Employee", back_populates="attendance_records")


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(String, nullable=False)  # Sick Leave, Casual Leave, Annual Leave
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    days = Column(Integer, default=1)
    reason = Column(Text, nullable=False)
    status = Column(String, default="Pending")  # Pending, Approved, Rejected

    employee = relationship("Employee", back_populates="leaves")
