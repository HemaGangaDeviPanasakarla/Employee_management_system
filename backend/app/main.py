"""
File: backend/app/main.py
Purpose: FastAPI Application Entry Point for Employee Management System.
Features:
  - Employee Management & Authentication
  - Isolated Employee Dashboards
  - Tasks Management (filtered by employee)
  - Attendance Records & Daily Clock-in / Clock-out
  - Leave Requests & Balance Tracking
All data is stored directly in PostgreSQL (no hardcoded data).
Data can be added and managed directly through Swagger UI at http://127.0.0.1:8000/docs.
"""

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime

try:
    from app.database import engine, SessionLocal, Base
    from app.models import Employee, Task, Attendance, Leave
    from app.schemas import (
        EmployeeResponse, EmployeeCreate, LoginRequest,
        TaskResponse, TaskCreate, TaskStatusUpdate,
        AttendanceResponse, AttendanceCreate, ClockInRequest,
        LeaveResponse, LeaveCreate,
        DashboardSummaryResponse, DashboardStats
    )
except ImportError:
    from database import engine, SessionLocal, Base
    from models import Employee, Task, Attendance, Leave
    from schemas import (
        EmployeeResponse, EmployeeCreate, LoginRequest,
        TaskResponse, TaskCreate, TaskStatusUpdate,
        AttendanceResponse, AttendanceCreate, ClockInRequest,
        LeaveResponse, LeaveCreate,
        DashboardSummaryResponse, DashboardStats
    )

# Initialize FastAPI App with Swagger metadata
app = FastAPI(
    title="Employee Management System API",
    description="Backend API for Employee Management. You can create employees, tasks, attendance, and leave records directly using this Swagger UI.",
    version="2.0.0"
)

# Allow React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Ensure database tables exist on startup
@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        # Ensure role column exists if upgrading an existing employees table
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'Employee';"))
            conn.commit()
        print("PostgreSQL tables verified and ready.")
    except Exception as e:
        print(f"Startup warning: {e}")


# ---------------- 1. Health & Root ---------------- #
@app.get("/", tags=["Health"])
def home():
    return {
        "status": "online",
        "message": "Employee Management API is running!",
        "docs_url": "http://127.0.0.1:8000/docs"
    }


# ---------------- 2. Authentication ---------------- #
@app.post("/login", response_model=EmployeeResponse, tags=["Authentication"])
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate employee by email.
    Returns employee details (id, name, email, department, role) to populate the frontend dashboard.
    """
    email_clean = request.email.strip().lower()
    employee = db.query(Employee).filter(Employee.email.ilike(email_clean)).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with email '{request.email}' not found. Please register this employee in PostgreSQL first."
        )
    return employee


# ---------------- 3. Employees ---------------- #
@app.get("/employees", response_model=List[EmployeeResponse], tags=["Employees"])
def get_all_employees(db: Session = Depends(get_db)):
    """List all registered employees in PostgreSQL."""
    return db.query(Employee).order_by(Employee.id).all()


@app.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED, tags=["Employees"])
def create_employee(emp_data: EmployeeCreate, db: Session = Depends(get_db)):
    """
    Add a new employee to PostgreSQL.
    """
    existing = db.query(Employee).filter(Employee.email == emp_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this email already exists."
        )
    new_employee = Employee(
        name=emp_data.name,
        email=emp_data.email,
        department=emp_data.department,
        role=emp_data.role or "Employee"
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee


@app.get("/employees/{employee_id}", response_model=EmployeeResponse, tags=["Employees"])
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """Get single employee profile by ID."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


# ---------------- 4. Dashboard Summary ---------------- #
@app.get("/employees/{employee_id}/dashboard-summary", response_model=DashboardSummaryResponse, tags=["Dashboard"])
def get_dashboard_summary(employee_id: int, db: Session = Depends(get_db)):
    """
    Get aggregated dashboard stats for the logged-in employee.
    Only queries records belonging to this specific employee.
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Tasks stats for THIS employee
    tasks = db.query(Task).filter(Task.employee_id == employee_id).all()
    total_tasks = len(tasks)
    pending_tasks = sum(1 for t in tasks if t.status == "Pending")
    in_progress_tasks = sum(1 for t in tasks if t.status == "In Progress")
    completed_tasks = sum(1 for t in tasks if t.status == "Completed")

    # Attendance stats for THIS employee
    attendance_records = db.query(Attendance).filter(Attendance.employee_id == employee_id).all()
    total_present = sum(1 for a in attendance_records if a.status in ["Present", "Late", "WFH"])
    attendance_rate = int((total_present / max(len(attendance_records), 1)) * 100) if attendance_records else 100

    today_str = datetime.now().strftime("%Y-%m-%d")
    today_attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date == today_str
    ).first()

    # Leave stats for THIS employee
    leaves = db.query(Leave).filter(Leave.employee_id == employee_id).all()
    leaves_used = sum(l.days for l in leaves if l.status == "Approved")
    leaves_pending = sum(l.days for l in leaves if l.status == "Pending")
    total_annual_allowance = 24
    total_leave_balance = max(0, total_annual_allowance - leaves_used)

    stats = DashboardStats(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks=completed_tasks,
        attendance_rate=attendance_rate,
        total_present_days=total_present,
        total_leave_balance=total_leave_balance,
        leaves_used=leaves_used,
        leaves_pending=leaves_pending
    )

    recent_tasks = db.query(Task).filter(Task.employee_id == employee_id).order_by(Task.id.desc()).limit(3).all()

    return DashboardSummaryResponse(
        employee=employee,
        stats=stats,
        recent_tasks=recent_tasks,
        today_attendance=today_attendance
    )


# ---------------- 5. Tasks ---------------- #
@app.get("/employees/{employee_id}/tasks", response_model=List[TaskResponse], tags=["Tasks"])
def get_employee_tasks(
    employee_id: int,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve all tasks assigned to the specific logged-in employee."""
    query = db.query(Task).filter(Task.employee_id == employee_id)
    if status_filter and status_filter != "All":
        query = query.filter(Task.status == status_filter)
    return query.order_by(Task.id.desc()).all()


@app.post("/employees/{employee_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
def create_task_for_employee(
    employee_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new task in PostgreSQL assigned to a specific employee.
    Use this endpoint in Swagger to add tasks.
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    new_task = Task(
        employee_id=employee_id,
        title=task_in.title,
        description=task_in.description or "",
        priority=task_in.priority or "Medium",
        status="Pending",
        due_date=task_in.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@app.patch("/tasks/{task_id}/status", response_model=TaskResponse, tags=["Tasks"])
def update_task_status(task_id: int, update: TaskStatusUpdate, db: Session = Depends(get_db)):
    """Update task status (Pending -> In Progress -> Completed)."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = update.status
    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", tags=["Tasks"])
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task from PostgreSQL."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


# ---------------- 6. Attendance ---------------- #
@app.get("/employees/{employee_id}/attendance", response_model=List[AttendanceResponse], tags=["Attendance"])
def get_employee_attendance(employee_id: int, db: Session = Depends(get_db)):
    """Retrieve all attendance history for the logged-in employee."""
    return db.query(Attendance).filter(Attendance.employee_id == employee_id).order_by(Attendance.id.desc()).all()


@app.post("/employees/{employee_id}/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED, tags=["Attendance"])
def add_attendance_record(
    employee_id: int,
    record_in: AttendanceCreate,
    db: Session = Depends(get_db)
):
    """
    Add an attendance record directly via Swagger for an employee.
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    new_attendance = Attendance(
        employee_id=employee_id,
        date=record_in.date,
        check_in=record_in.check_in,
        check_out=record_in.check_out,
        status=record_in.status or "Present",
        work_hours=record_in.work_hours or "8.0 hrs"
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance


@app.post("/employees/{employee_id}/attendance/clock-in", response_model=AttendanceResponse, tags=["Attendance"])
def clock_in(employee_id: int, clock_data: ClockInRequest = None, db: Session = Depends(get_db)):
    """Record clock-in for the current day."""
    today_str = (clock_data.date if clock_data and clock_data.date else datetime.now().strftime("%Y-%m-%d"))
    time_str = (clock_data.time if clock_data and clock_data.time else datetime.now().strftime("%I:%M %p"))

    record = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date == today_str
    ).first()

    if not record:
        record = Attendance(
            employee_id=employee_id,
            date=today_str,
            check_in=time_str,
            check_out="--",
            status="Present",
            work_hours="In Progress"
        )
        db.add(record)
    else:
        record.check_in = time_str
        record.status = "Present"

    db.commit()
    db.refresh(record)
    return record


@app.post("/employees/{employee_id}/attendance/clock-out", response_model=AttendanceResponse, tags=["Attendance"])
def clock_out(employee_id: int, clock_data: ClockInRequest = None, db: Session = Depends(get_db)):
    """Record clock-out for the current day."""
    today_str = (clock_data.date if clock_data and clock_data.date else datetime.now().strftime("%Y-%m-%d"))
    time_str = (clock_data.time if clock_data and clock_data.time else datetime.now().strftime("%I:%M %p"))

    record = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date == today_str
    ).first()

    if not record:
        record = Attendance(
            employee_id=employee_id,
            date=today_str,
            check_in="09:00 AM",
            check_out=time_str,
            status="Present",
            work_hours="8.0 hrs"
        )
        db.add(record)
    else:
        record.check_out = time_str
        record.work_hours = "8.5 hrs"

    db.commit()
    db.refresh(record)
    return record


# ---------------- 7. Leaves ---------------- #
@app.get("/employees/{employee_id}/leaves", response_model=List[LeaveResponse], tags=["Leaves"])
def get_employee_leaves(employee_id: int, db: Session = Depends(get_db)):
    """Retrieve all leave history for the logged-in employee."""
    return db.query(Leave).filter(Leave.employee_id == employee_id).order_by(Leave.id.desc()).all()


@app.post("/employees/{employee_id}/leaves", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED, tags=["Leaves"])
def apply_leave(employee_id: int, leave_in: LeaveCreate, db: Session = Depends(get_db)):
    """
    Submit or create a leave application in PostgreSQL.
    Use this endpoint in Swagger or the UI to add leave records.
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    new_leave = Leave(
        employee_id=employee_id,
        leave_type=leave_in.leave_type,
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        days=leave_in.days,
        reason=leave_in.reason,
        status="Pending"
    )
    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    return new_leave
