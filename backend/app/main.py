"""
File: backend/app/main.py
Purpose: FastAPI Application Entry Point for Employee and Manager Management System.
Features:
  - Role-based Authentication (Sign Up & Sign In with password hashing, roles: Employee / Manager)
  - Employee Dashboard:
      * Welcome banner & metrics summary
      * Timesheet: Add timesheet modal, view records in table, edit & delete
      * Tasks: Tab 1: My Tasks (self-created/owned), Tab 2: Assigned Tasks (manager-assigned)
      * Attendance: Check-In & Check-Out with duplicate/invalid check prevention
      * My Leaves: Leave history, balance calculation, apply leave
  - Manager Dashboard:
      * All employee personal features (own timesheet, tasks, attendance, leaves)
      * My Team Section (Manager only):
          - Tab 1: Project Details (team projects, progress, assigned team members)
          - Tab 2: Team Details (reporting team members, task summary, project)
          - Individual Team Member Details (Employee info, task statistics, assigned tasks table, leaves)
          - Task Assignment Dialog (assign task to team member, updates counts & appears in employee's Assigned Tasks)
"""

import os
import hashlib
import secrets
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

try:
    from app.database import engine, SessionLocal, Base
    from app.models import Employee, Project, Task, Timesheet, DailyWorkReport, Attendance, Leave
    from app.schemas import (
        RegisterRequest, LoginRequest, EmployeeResponse, EmployeeCreate,
        TimesheetCreate, TimesheetUpdate, TimesheetResponse,
        ProjectResponse, ProjectCreate, ProjectUpdate,
        TaskResponse, TaskCreate, TaskUpdate, TaskStatusUpdate,
        DailyWorkReportResponse, DailyWorkReportCreate, DailyWorkReportReview,
        AttendanceResponse, AttendanceCreate, ClockInRequest,
        LeaveResponse, LeaveCreate, LeaveStatusUpdate,
        DashboardSummaryResponse, DashboardStats,
        TeamMemberItem, IndividualMemberDetailResponse,
        ManagerDashboardResponse, ManagerStats, TeamOverview, EmployeePerformance
    )
except ImportError:
    from database import engine, SessionLocal, Base
    from models import Employee, Project, Task, Timesheet, DailyWorkReport, Attendance, Leave
    from schemas import (
        RegisterRequest, LoginRequest, EmployeeResponse, EmployeeCreate,
        TimesheetCreate, TimesheetUpdate, TimesheetResponse,
        ProjectResponse, ProjectCreate, ProjectUpdate,
        TaskResponse, TaskCreate, TaskUpdate, TaskStatusUpdate,
        DailyWorkReportResponse, DailyWorkReportCreate, DailyWorkReportReview,
        AttendanceResponse, AttendanceCreate, ClockInRequest,
        LeaveResponse, LeaveCreate, LeaveStatusUpdate,
        DashboardSummaryResponse, DashboardStats,
        TeamMemberItem, IndividualMemberDetailResponse,
        ManagerDashboardResponse, ManagerStats, TeamOverview, EmployeePerformance
    )

app = FastAPI(
    title="Employee & Manager Management System API",
    description="Role-based FastAPI backend supporting Employee & Manager workflows.",
    version="4.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(8)
    h = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}${h}"


def verify_password(password: str, hashed: Optional[str]) -> bool:
    if not hashed:
        return True  # If legacy user without password, allow initial login
    if "$" not in hashed:
        return password == hashed
    salt, h = hashed.split("$", 1)
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest() == h


@app.on_event("startup")
def on_startup():
    init_db()

def init_db():
    try:
        # Create all declared tables
        Base.metadata.create_all(bind=engine)

        # Ensure schema migrations if tables pre-existed
        with engine.connect() as conn:
            dialect = engine.dialect.name
            if dialect == "postgresql":
                conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'Employee';"))
                conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS password VARCHAR;"))
                conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS designation VARCHAR DEFAULT 'Employee';"))
                conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS manager_id INTEGER;"))
                conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS project_name VARCHAR;"))
                conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by_id INTEGER;"))
                conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_by_role VARCHAR DEFAULT 'Self';"))
                conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_name VARCHAR DEFAULT 'General';"))
                conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id INTEGER;"))
                conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_date VARCHAR;"))
                conn.commit()
            elif dialect == "sqlite":
                cols = [c[1] for c in conn.execute(text("PRAGMA table_info(employees);")).fetchall()]
                if "password" not in cols:
                    conn.execute(text("ALTER TABLE employees ADD COLUMN password VARCHAR;"))
                if "role" not in cols:
                    conn.execute(text("ALTER TABLE employees ADD COLUMN role VARCHAR DEFAULT 'Employee';"))
                if "designation" not in cols:
                    conn.execute(text("ALTER TABLE employees ADD COLUMN designation VARCHAR DEFAULT 'Employee';"))
                if "manager_id" not in cols:
                    conn.execute(text("ALTER TABLE employees ADD COLUMN manager_id INTEGER;"))
                if "project_name" not in cols:
                    conn.execute(text("ALTER TABLE employees ADD COLUMN project_name VARCHAR;"))

                task_cols = [c[1] for c in conn.execute(text("PRAGMA table_info(tasks);")).fetchall()]
                if "created_by_id" not in task_cols:
                    conn.execute(text("ALTER TABLE tasks ADD COLUMN created_by_id INTEGER;"))
                if "assigned_by_role" not in task_cols:
                    conn.execute(text("ALTER TABLE tasks ADD COLUMN assigned_by_role VARCHAR DEFAULT 'Self';"))
                if "project_name" not in task_cols:
                    conn.execute(text("ALTER TABLE tasks ADD COLUMN project_name VARCHAR DEFAULT 'General';"))
                if "project_id" not in task_cols:
                    conn.execute(text("ALTER TABLE tasks ADD COLUMN project_id INTEGER;"))
                if "assigned_date" not in task_cols:
                    conn.execute(text("ALTER TABLE tasks ADD COLUMN assigned_date VARCHAR;"))
                conn.commit()

        print("Database schema verified successfully.")
    except Exception as e:
        print(f"Startup notice: {e}")

# Run schema initialization on module load
init_db()


# ---------------- 1. Health & Root ---------------- #
@app.get("/", tags=["Health"])
def home():
    return {
        "status": "online",
        "system": "Employee & Manager Management System",
        "roles": ["Employee", "Manager"],
        "docs_url": "http://127.0.0.1:8000/docs"
    }


# ---------------- 2. Authentication ---------------- #
@app.post("/register", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Account Registration:
    - Name, Email, Password, Confirm Password, Account Role (Employee / Manager).
    - Validates email format, required fields, matching passwords.
    - Associates employees with a default Manager if available.
    """
    if request.confirm_password and request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and Confirm Password do not match."
        )

    clean_email = request.email.strip().lower()
    existing = db.query(Employee).filter(Employee.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in."
        )

    # Standardize role: Employee or Manager
    role = "Manager" if request.role.lower() == "manager" else "Employee"
    department = request.department or ("Management" if role == "Manager" else "Engineering")
    designation = request.designation or ("Engineering Manager" if role == "Manager" else f"{department} Developer")

    # If new user is an Employee, associate with the first manager found
    mgr = db.query(Employee).filter(Employee.role == "Manager").first()
    manager_id = mgr.id if (mgr and role == "Employee") else None

    new_emp = Employee(
        name=request.name.strip(),
        email=clean_email,
        password=hash_password(request.password),
        department=department,
        role=role,
        designation=designation,
        manager_id=manager_id,
        project_name=request.project_name
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp


@app.post("/login", response_model=EmployeeResponse, tags=["Authentication"])
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Sign In:
    - Email & Password validation.
    - Returns authenticated user details and role ('Employee' or 'Manager').
    """
    clean_email = request.email.strip().lower()
    employee = db.query(Employee).filter(Employee.email.ilike(clean_email)).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid email or password. No account found with '{request.email}'."
        )

    if request.password and employee.password:
        if not verify_password(request.password, employee.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials. Incorrect password."
            )
    elif request.password and not employee.password:
        # User has no password set yet; set it on first login
        employee.password = hash_password(request.password)
        db.commit()

    return employee


# ---------------- 3. Employees ---------------- #
@app.get("/employees", response_model=List[EmployeeResponse], tags=["Employees"])
def get_all_employees(
    department: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Employee)
    if department and department != "All":
        query = query.filter(Employee.department.ilike(department))
    if role and role != "All":
        query = query.filter(Employee.role == role)
    return query.order_by(Employee.id).all()


@app.get("/employees/{employee_id}", response_model=EmployeeResponse, tags=["Employees"])
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


# ---------------- 4. Timesheet Module (Employee & Manager) ---------------- #
@app.get("/employees/{employee_id}/timesheets", response_model=List[TimesheetResponse], tags=["Timesheets"])
def get_employee_timesheets(employee_id: int, db: Session = Depends(get_db)):
    """Retrieve all timesheet records submitted by this employee or manager."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    records = db.query(Timesheet).filter(Timesheet.employee_id == employee_id).order_by(Timesheet.date.desc(), Timesheet.id.desc()).all()
    return [
        TimesheetResponse(
            id=t.id,
            employee_id=t.employee_id,
            employee_name=emp.name,
            date=t.date,
            project_name=t.project_name,
            work_description=t.work_description,
            hours_worked=t.hours_worked,
            created_at=t.created_at
        )
        for t in records
    ]


@app.post("/employees/{employee_id}/timesheets", response_model=TimesheetResponse, status_code=status.HTTP_201_CREATED, tags=["Timesheets"])
def add_timesheet_entry(employee_id: int, entry_in: TimesheetCreate, db: Session = Depends(get_db)):
    """
    Submit a daily timesheet entry:
    - Date, Project Name, Task / Work Description, Hours Worked.
    """
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    new_timesheet = Timesheet(
        employee_id=employee_id,
        date=entry_in.date,
        project_name=entry_in.project_name,
        work_description=entry_in.work_description,
        hours_worked=entry_in.hours_worked or "8.0",
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    db.add(new_timesheet)
    db.commit()
    db.refresh(new_timesheet)

    return TimesheetResponse(
        id=new_timesheet.id,
        employee_id=new_timesheet.employee_id,
        employee_name=emp.name,
        date=new_timesheet.date,
        project_name=new_timesheet.project_name,
        work_description=new_timesheet.work_description,
        hours_worked=new_timesheet.hours_worked,
        created_at=new_timesheet.created_at
    )


@app.put("/timesheets/{timesheet_id}", response_model=TimesheetResponse, tags=["Timesheets"])
def update_timesheet(timesheet_id: int, entry_update: TimesheetUpdate, db: Session = Depends(get_db)):
    """Edit a timesheet entry."""
    entry = db.query(Timesheet).filter(Timesheet.id == timesheet_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timesheet entry not found")

    if entry_update.date is not None:
        entry.date = entry_update.date
    if entry_update.project_name is not None:
        entry.project_name = entry_update.project_name
    if entry_update.work_description is not None:
        entry.work_description = entry_update.work_description
    if entry_update.hours_worked is not None:
        entry.hours_worked = entry_update.hours_worked

    db.commit()
    db.refresh(entry)

    emp = db.query(Employee).filter(Employee.id == entry.employee_id).first()
    return TimesheetResponse(
        id=entry.id,
        employee_id=entry.employee_id,
        employee_name=emp.name if emp else "",
        date=entry.date,
        project_name=entry.project_name,
        work_description=entry.work_description,
        hours_worked=entry.hours_worked,
        created_at=entry.created_at
    )


@app.delete("/timesheets/{timesheet_id}", tags=["Timesheets"])
def delete_timesheet(timesheet_id: int, db: Session = Depends(get_db)):
    """Delete a timesheet entry."""
    entry = db.query(Timesheet).filter(Timesheet.id == timesheet_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timesheet entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Timesheet entry deleted successfully"}


# ---------------- 5. Tasks Module (My Tasks & Assigned Tasks) ---------------- #
@app.get("/employees/{employee_id}/tasks", response_model=List[TaskResponse], tags=["Tasks"])
def get_employee_tasks(
    employee_id: int,
    status_filter: Optional[str] = None,
    source_filter: Optional[str] = None,  # 'All', 'Manager', 'Self'
    db: Session = Depends(get_db)
):
    """
    Get tasks for employee. Supports filtering:
    - My Tasks tab: source_filter='Self' or all tasks belonging to the user
    - Assigned Tasks tab: source_filter='Manager' (assigned to the employee by their manager)
    """
    query = db.query(Task).filter(Task.employee_id == employee_id)
    if status_filter and status_filter != "All":
        query = query.filter(Task.status == status_filter)
    if source_filter and source_filter != "All":
        query = query.filter(Task.assigned_by_role == source_filter)

    tasks = query.order_by(Task.id.desc()).all()
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    employees = {e.id: e for e in db.query(Employee).all()}

    results = []
    for t in tasks:
        creator = employees.get(t.created_by_id)
        results.append(TaskResponse(
            id=t.id,
            employee_id=t.employee_id,
            employee_name=emp.name if emp else "Unknown",
            employee_department=emp.department if emp else "",
            created_by_id=t.created_by_id,
            created_by_name=creator.name if creator else ("Manager" if t.assigned_by_role == "Manager" else emp.name if emp else "Self"),
            assigned_by_role=t.assigned_by_role or "Self",
            project_id=t.project_id,
            project_name=t.project_name or "General",
            title=t.title,
            description=t.description or "",
            priority=t.priority,
            status=t.status,
            assigned_date=t.assigned_date,
            due_date=t.due_date
        ))
    return results


@app.post("/employees/{employee_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
def create_task_for_employee(employee_id: int, task_in: TaskCreate, db: Session = Depends(get_db)):
    """Create self-owned task for employee."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    today_str = datetime.now().strftime("%Y-%m-%d")
    new_task = Task(
        employee_id=employee_id,
        created_by_id=employee_id,
        assigned_by_role="Self",
        project_name=task_in.project_name or emp.project_name or "General",
        project_id=task_in.project_id,
        title=task_in.title,
        description=task_in.description or "",
        priority=task_in.priority or "Medium",
        status="Pending",
        assigned_date=task_in.assigned_date or today_str,
        due_date=task_in.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return TaskResponse(
        id=new_task.id,
        employee_id=new_task.employee_id,
        employee_name=emp.name,
        employee_department=emp.department,
        created_by_id=employee_id,
        created_by_name=emp.name,
        assigned_by_role="Self",
        project_id=new_task.project_id,
        project_name=new_task.project_name,
        title=new_task.title,
        description=new_task.description,
        priority=new_task.priority,
        status=new_task.status,
        assigned_date=new_task.assigned_date,
        due_date=new_task.due_date
    )


@app.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
def assign_task_to_employee(task_in: TaskCreate, db: Session = Depends(get_db)):
    """Manager assigning a task to an employee."""
    if not task_in.employee_id:
        raise HTTPException(status_code=400, detail="Target employee_id is required.")

    emp = db.query(Employee).filter(Employee.id == task_in.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Assignee employee not found.")

    today_str = datetime.now().strftime("%Y-%m-%d")
    new_task = Task(
        employee_id=task_in.employee_id,
        created_by_id=task_in.created_by_id,
        assigned_by_role="Manager",
        project_name=task_in.project_name or emp.project_name or "General",
        project_id=task_in.project_id,
        title=task_in.title,
        description=task_in.description or "",
        priority=task_in.priority or "Medium",
        status="Pending",
        assigned_date=task_in.assigned_date or today_str,
        due_date=task_in.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    creator = db.query(Employee).filter(Employee.id == task_in.created_by_id).first() if task_in.created_by_id else None

    return TaskResponse(
        id=new_task.id,
        employee_id=new_task.employee_id,
        employee_name=emp.name,
        employee_department=emp.department,
        created_by_id=new_task.created_by_id,
        created_by_name=creator.name if creator else "Manager",
        assigned_by_role="Manager",
        project_id=new_task.project_id,
        project_name=new_task.project_name,
        title=new_task.title,
        description=new_task.description,
        priority=new_task.priority,
        status=new_task.status,
        assigned_date=new_task.assigned_date,
        due_date=new_task.due_date
    )


@app.patch("/tasks/{task_id}/status", response_model=TaskResponse, tags=["Tasks"])
def update_task_status(task_id: int, update: TaskStatusUpdate, db: Session = Depends(get_db)):
    """Update task status (Pending -> In Progress -> Completed)."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = update.status
    db.commit()
    db.refresh(task)

    emp = db.query(Employee).filter(Employee.id == task.employee_id).first()
    creator = db.query(Employee).filter(Employee.id == task.created_by_id).first() if task.created_by_id else None

    return TaskResponse(
        id=task.id,
        employee_id=task.employee_id,
        employee_name=emp.name if emp else "Unknown",
        employee_department=emp.department if emp else "",
        created_by_id=task.created_by_id,
        created_by_name=creator.name if creator else "Manager",
        assigned_by_role=task.assigned_by_role or "Self",
        project_id=task.project_id,
        project_name=task.project_name or "General",
        title=task.title,
        description=task.description or "",
        priority=task.priority,
        status=task.status,
        assigned_date=task.assigned_date,
        due_date=task.due_date
    )


@app.delete("/tasks/{task_id}", tags=["Tasks"])
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


# ---------------- 6. Attendance Module ---------------- #
@app.get("/employees/{employee_id}/attendance", response_model=List[AttendanceResponse], tags=["Attendance"])
def get_employee_attendance(employee_id: int, db: Session = Depends(get_db)):
    return db.query(Attendance).filter(Attendance.employee_id == employee_id).order_by(Attendance.date.desc(), Attendance.id.desc()).all()


@app.post("/employees/{employee_id}/attendance/clock-in", response_model=AttendanceResponse, tags=["Attendance"])
def clock_in(employee_id: int, clock_data: Optional[ClockInRequest] = None, db: Session = Depends(get_db)):
    """
    Check-In:
    - Records employee's check-in time.
    - Prevents duplicate check-ins for the same day.
    """
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    today_str = clock_data.date if (clock_data and clock_data.date) else datetime.now().strftime("%Y-%m-%d")
    time_str = clock_data.time if (clock_data and clock_data.time) else datetime.now().strftime("%I:%M %p")

    record = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date == today_str
    ).first()

    if record and record.check_in and record.check_in != "--":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already checked in today at {record.check_in}. Duplicate check-in is not permitted."
        )

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
        record.work_hours = "In Progress"

    db.commit()
    db.refresh(record)
    return record


@app.post("/employees/{employee_id}/attendance/clock-out", response_model=AttendanceResponse, tags=["Attendance"])
def clock_out(employee_id: int, clock_data: Optional[ClockInRequest] = None, db: Session = Depends(get_db)):
    """
    Check-Out:
    - Records check-out time.
    - Prevents invalid check-out if not checked in or already checked out.
    """
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    today_str = clock_data.date if (clock_data and clock_data.date) else datetime.now().strftime("%Y-%m-%d")
    time_str = clock_data.time if (clock_data and clock_data.time) else datetime.now().strftime("%I:%M %p")

    record = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date == today_str
    ).first()

    if not record or not record.check_in or record.check_in == "--":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot check out: You have not checked in for today yet."
        )

    if record.check_out and record.check_out != "--":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already checked out today at {record.check_out}."
        )

    record.check_out = time_str
    record.work_hours = "8.5 hrs"
    db.commit()
    db.refresh(record)
    return record


# ---------------- 7. Leaves Module ---------------- #
@app.get("/employees/{employee_id}/leaves", response_model=List[LeaveResponse], tags=["Leaves"])
def get_employee_leaves(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    leaves = db.query(Leave).filter(Leave.employee_id == employee_id).order_by(Leave.id.desc()).all()
    return [
        LeaveResponse(
            id=l.id,
            employee_id=l.employee_id,
            employee_name=emp.name,
            department=emp.department,
            leave_type=l.leave_type,
            start_date=l.start_date,
            end_date=l.end_date,
            days=l.days,
            reason=l.reason,
            status=l.status
        )
        for l in leaves
    ]


@app.post("/employees/{employee_id}/leaves", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED, tags=["Leaves"])
def apply_leave(employee_id: int, leave_in: LeaveCreate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
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

    return LeaveResponse(
        id=new_leave.id,
        employee_id=new_leave.employee_id,
        employee_name=emp.name,
        department=emp.department,
        leave_type=new_leave.leave_type,
        start_date=new_leave.start_date,
        end_date=new_leave.end_date,
        days=new_leave.days,
        reason=new_leave.reason,
        status=new_leave.status
    )


@app.patch("/leaves/{leave_id}/status", response_model=LeaveResponse, tags=["Leaves"])
def update_leave_status(leave_id: int, status_update: LeaveStatusUpdate, db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = status_update.status
    db.commit()
    db.refresh(leave)

    emp = db.query(Employee).filter(Employee.id == leave.employee_id).first()
    return LeaveResponse(
        id=leave.id,
        employee_id=leave.employee_id,
        employee_name=emp.name if emp else "Unknown",
        department=emp.department if emp else "",
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        days=leave.days,
        reason=leave.reason,
        status=leave.status
    )


# ---------------- 8. Personal Dashboard Summary ---------------- #
@app.get("/employees/{employee_id}/dashboard-summary", response_model=DashboardSummaryResponse, tags=["Dashboard"])
def get_dashboard_summary(employee_id: int, db: Session = Depends(get_db)):
    """Personal dashboard stats for logged-in user (Employee or Manager)."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    tasks = db.query(Task).filter(Task.employee_id == employee_id).all()
    total_tasks = len(tasks)
    pending_tasks = sum(1 for t in tasks if t.status == "Pending")
    in_progress_tasks = sum(1 for t in tasks if t.status == "In Progress")
    completed_tasks = sum(1 for t in tasks if t.status == "Completed")
    manager_assigned = sum(1 for t in tasks if t.assigned_by_role == "Manager")
    self_created = sum(1 for t in tasks if t.assigned_by_role != "Manager")

    attendance_records = db.query(Attendance).filter(Attendance.employee_id == employee_id).all()
    total_present = sum(1 for a in attendance_records if a.status in ["Present", "Late", "WFH"])
    attendance_rate = int((total_present / max(len(attendance_records), 1)) * 100) if attendance_records else 100

    today_str = datetime.now().strftime("%Y-%m-%d")
    today_attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date == today_str
    ).first()

    leaves = db.query(Leave).filter(Leave.employee_id == employee_id).all()
    leaves_used = sum(l.days for l in leaves if l.status == "Approved")
    leaves_pending = sum(l.days for l in leaves if l.status == "Pending")
    total_leave_balance = max(0, 24 - leaves_used)

    timesheets = db.query(Timesheet).filter(Timesheet.employee_id == employee_id).order_by(Timesheet.date.desc(), Timesheet.id.desc()).all()

    stats = DashboardStats(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks=completed_tasks,
        manager_assigned_tasks=manager_assigned,
        self_created_tasks=self_created,
        attendance_rate=attendance_rate,
        total_present_days=total_present,
        total_leave_balance=total_leave_balance,
        leaves_used=leaves_used,
        leaves_pending=leaves_pending,
        timesheets_count=len(timesheets)
    )

    raw_recent_tasks = db.query(Task).filter(Task.employee_id == employee_id).order_by(Task.id.desc()).limit(5).all()
    recent_tasks = [
        TaskResponse(
            id=t.id,
            employee_id=t.employee_id,
            employee_name=employee.name,
            employee_department=employee.department,
            created_by_id=t.created_by_id,
            assigned_by_role=t.assigned_by_role or "Self",
            project_id=t.project_id,
            project_name=t.project_name or "General",
            title=t.title,
            description=t.description or "",
            priority=t.priority,
            status=t.status,
            assigned_date=t.assigned_date,
            due_date=t.due_date
        )
        for t in raw_recent_tasks
    ]

    recent_timesheets = [
        TimesheetResponse(
            id=ts.id,
            employee_id=ts.employee_id,
            employee_name=employee.name,
            date=ts.date,
            project_name=ts.project_name,
            work_description=ts.work_description,
            hours_worked=ts.hours_worked,
            created_at=ts.created_at
        )
        for ts in timesheets[:4]
    ]

    return DashboardSummaryResponse(
        employee=employee,
        stats=stats,
        recent_tasks=recent_tasks,
        today_attendance=today_attendance,
        recent_timesheets=recent_timesheets
    )


# ---------------- 9. My Team (Manager Only Endpoints) ---------------- #
@app.get("/manager/{manager_id}/projects", response_model=List[ProjectResponse], tags=["Manager - My Team"])
def get_manager_team_projects(manager_id: int, db: Session = Depends(get_db)):
    """
    My Team - Tab 1: Project Details
    Display only projects associated with the logged-in manager's team.
    Includes project name, description, status, start date, due date, and team members count.
    """
    manager = db.query(Employee).filter(Employee.id == manager_id, Employee.role == "Manager").first()
    if not manager:
        raise HTTPException(status_code=403, detail="Access denied. User is not a manager.")

    projects = db.query(Project).filter(Project.manager_id == manager_id).all()

    team_members = db.query(Employee).filter(Employee.manager_id == manager_id).all()

    results = []
    for p in projects:
        # Assigned team members on this project
        proj_members = [
            m for m in team_members
            if m.project_name and m.project_name.strip().lower() == p.name.strip().lower()
        ]
        results.append(ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description or "",
            department=p.department,
            status=p.status,
            progress=p.progress,
            start_date=p.start_date,
            due_date=p.due_date,
            manager_id=p.manager_id,
            team_members_count=len(proj_members),
            team_members=proj_members
        ))
    return results


@app.get("/manager/{manager_id}/team", response_model=List[TeamMemberItem], tags=["Manager - My Team"])
def get_manager_team_members(manager_id: int, db: Session = Depends(get_db)):
    """
    My Team - Tab 2: Team Details
    Display all team members reporting to the logged-in manager.
    Shows Employee Name, Email, Role, Project Name, and Task Summary.
    """
    manager = db.query(Employee).filter(Employee.id == manager_id, Employee.role == "Manager").first()
    if not manager:
        raise HTTPException(status_code=403, detail="Access denied. User is not a manager.")

    members = db.query(Employee).filter(Employee.manager_id == manager_id, Employee.id != manager_id).all()

    results = []
    for m in members:
        m_tasks = db.query(Task).filter(Task.employee_id == m.id).all()
        total_t = len(m_tasks)
        comp_t = sum(1 for t in m_tasks if t.status == "Completed")
        inp_t = sum(1 for t in m_tasks if t.status == "In Progress")
        pend_t = sum(1 for t in m_tasks if t.status == "Pending")

        if total_t == 0:
            summary_txt = "No active tasks assigned yet."
        else:
            summary_txt = f"{comp_t}/{total_t} completed ({inp_t} in progress, {pend_t} pending)"

        results.append(TeamMemberItem(
            id=m.id,
            name=m.name,
            email=m.email,
            role=m.role,
            project_name=m.project_name or "Unassigned",
            task_summary=summary_txt,
            total_tasks=total_t,
            completed_tasks=comp_t,
            in_progress_tasks=inp_t,
            pending_tasks=pend_t
        ))
    return results


@app.get("/manager/{manager_id}/team/{employee_id}", response_model=IndividualMemberDetailResponse, tags=["Manager - My Team"])
def get_individual_member_details(manager_id: int, employee_id: int, db: Session = Depends(get_db)):
    """
    Individual Team Member Details:
    1. Employee Information (Name, Email, Role, Assigned Project)
    2. Task Overview cards (Total, Completed, In Progress, Pending)
    3. Task Details table (Task Name, Project, Assigned Date, Due Date, Status)
    4. Leave Details (Leave Type, Start Date, End Date, Reason, Leave Status)
    """
    manager = db.query(Employee).filter(Employee.id == manager_id, Employee.role == "Manager").first()
    if not manager:
        raise HTTPException(status_code=403, detail="Access denied. User is not a manager.")

    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Team member not found.")

    tasks = db.query(Task).filter(Task.employee_id == employee_id).order_by(Task.id.desc()).all()
    leaves = db.query(Leave).filter(Leave.employee_id == employee_id).order_by(Leave.id.desc()).all()

    total_t = len(tasks)
    comp_t = sum(1 for t in tasks if t.status == "Completed")
    inp_t = sum(1 for t in tasks if t.status == "In Progress")
    pend_t = sum(1 for t in tasks if t.status == "Pending")

    task_responses = [
        TaskResponse(
            id=t.id,
            employee_id=t.employee_id,
            employee_name=emp.name,
            employee_department=emp.department,
            created_by_id=t.created_by_id,
            assigned_by_role=t.assigned_by_role or "Self",
            project_id=t.project_id,
            project_name=t.project_name or emp.project_name or "General",
            title=t.title,
            description=t.description or "",
            priority=t.priority,
            status=t.status,
            assigned_date=t.assigned_date,
            due_date=t.due_date
        )
        for t in tasks
    ]

    leave_responses = [
        LeaveResponse(
            id=l.id,
            employee_id=l.employee_id,
            employee_name=emp.name,
            department=emp.department,
            leave_type=l.leave_type,
            start_date=l.start_date,
            end_date=l.end_date,
            days=l.days,
            reason=l.reason,
            status=l.status
        )
        for l in leaves
    ]

    return IndividualMemberDetailResponse(
        employee=emp,
        assigned_project=emp.project_name or "Unassigned",
        stats={
            "total_tasks": total_t,
            "completed_tasks": comp_t,
            "in_progress_tasks": inp_t,
            "pending_tasks": pend_t
        },
        tasks=task_responses,
        leaves=leave_responses
    )


@app.post("/manager/{manager_id}/assign-task", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, tags=["Manager - My Team"])
def manager_assign_task(manager_id: int, task_in: TaskCreate, db: Session = Depends(get_db)):
    """
    Manager Task Assignment dialog submission:
    - Select Employee, Project Name, Task Title, Task Description, Assigned Date, Due Date, Priority.
    - Saves task and associates with target employee with assigned_by_role='Manager'.
    - Appears in employee's Assigned Tasks tab and manager's team view.
    """
    manager = db.query(Employee).filter(Employee.id == manager_id, Employee.role == "Manager").first()
    if not manager:
        raise HTTPException(status_code=403, detail="Access denied. User is not a manager.")

    if not task_in.employee_id:
        raise HTTPException(status_code=400, detail="Employee selection is required.")

    emp = db.query(Employee).filter(Employee.id == task_in.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Assignee employee not found.")

    today_str = datetime.now().strftime("%Y-%m-%d")
    new_task = Task(
        employee_id=task_in.employee_id,
        created_by_id=manager_id,
        assigned_by_role="Manager",
        project_name=task_in.project_name or emp.project_name or "General",
        project_id=task_in.project_id,
        title=task_in.title,
        description=task_in.description or "",
        priority=task_in.priority or "Medium",
        status="Pending",
        assigned_date=task_in.assigned_date or today_str,
        due_date=task_in.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return TaskResponse(
        id=new_task.id,
        employee_id=new_task.employee_id,
        employee_name=emp.name,
        employee_department=emp.department,
        created_by_id=manager_id,
        created_by_name=manager.name,
        assigned_by_role="Manager",
        project_id=new_task.project_id,
        project_name=new_task.project_name,
        title=new_task.title,
        description=new_task.description,
        priority=new_task.priority,
        status=new_task.status,
        assigned_date=new_task.assigned_date,
        due_date=new_task.due_date
    )
