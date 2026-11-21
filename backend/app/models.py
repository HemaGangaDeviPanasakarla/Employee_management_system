"""
File: backend/app/models.py
Purpose: Defines SQLAlchemy ORM database models for Employee Management.
Models:
  - Employee: Represents company employees.
  - Task: Tasks assigned to a specific employee.
  - Attendance: Daily clock-in/clock-out attendance records.
  - Leave: Leave applications and requests per employee.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

try:
    from app.database import Base
except ImportError:
    from database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)
    role = Column(String, default="Employee")

    # Relationships
    tasks = relationship("Task", back_populates="employee", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leaves = relationship("Leave", back_populates="employee", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="Medium")  # High, Medium, Low
    status = Column(String, default="Pending")    # Pending, In Progress, Completed
    due_date = Column(String, nullable=False)

    employee = relationship("Employee", back_populates="tasks")


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
