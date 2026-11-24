"""
File: backend/seed_db.py
Purpose: Standalone database seeding script to populate initial PostgreSQL/SQLite records if desired.
Run manually with: python seed_db.py
"""

import sys
import os
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import Employee, Project, Task, Timesheet, Attendance, Leave
from app.main import hash_password

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Employee).count() > 0:
            print("Database already contains employees. Skipping seed.")
            return

        print("Seeding initial Manager and Team Members into database...")
        # 1. Create Manager
        mgr = Employee(
            name="Alex Turner",
            email="alex.manager@company.com",
            password=hash_password("password123"),
            department="Management",
            role="Manager",
            designation="Engineering Manager",
            project_name="Core Web Platform v3"
        )
        db.add(mgr)
        db.commit()
        db.refresh(mgr)

        # 2. Create Team Employees reporting to Manager
        employees_data = [
            {
                "name": "Sarah Chen",
                "email": "sarah.frontend@company.com",
                "password": hash_password("password123"),
                "department": "Frontend",
                "role": "Employee",
                "designation": "Senior Frontend Developer",
                "manager_id": mgr.id,
                "project_name": "Core Web Platform v3"
            },
            {
                "name": "David Miller",
                "email": "david.backend@company.com",
                "password": hash_password("password123"),
                "department": "Backend",
                "role": "Employee",
                "designation": "Senior Backend Developer",
                "manager_id": mgr.id,
                "project_name": "Microservices & Auth Migration"
            },
            {
                "name": "Elena Rostova",
                "email": "elena.testing@company.com",
                "password": hash_password("password123"),
                "department": "Testing",
                "role": "Employee",
                "designation": "QA Automation Lead",
                "manager_id": mgr.id,
                "project_name": "End-to-End Automated Test Suite"
            }
        ]

        created_emps = {}
        for ed in employees_data:
            emp = Employee(**ed)
            db.add(emp)
            db.commit()
            db.refresh(emp)
            created_emps[emp.email] = emp

        fe = created_emps.get("sarah.frontend@company.com")
        be = created_emps.get("david.backend@company.com")
        qa = created_emps.get("elena.testing@company.com")

        # 3. Create Projects managed by Alex Turner
        projects = [
            Project(
                name="Core Web Platform v3",
                description="Modernizing user interface, performance optimization, and responsive design.",
                department="Frontend",
                status="In Progress",
                progress=75,
                start_date="2026-10-01",
                due_date="2026-12-15",
                manager_id=mgr.id
            ),
            Project(
                name="Microservices & Auth Migration",
                description="High-availability API gateway, token auth, and database performance tuning.",
                department="Backend",
                status="In Progress",
                progress=65,
                start_date="2026-10-15",
                due_date="2026-12-30",
                manager_id=mgr.id
            ),
            Project(
                name="End-to-End Automated Test Suite",
                description="Comprehensive regression testing, CI/CD automated pipeline integration.",
                department="Testing",
                status="In Progress",
                progress=85,
                start_date="2026-11-01",
                due_date="2026-12-20",
                manager_id=mgr.id
            )
        ]
        db.add_all(projects)
        db.commit()

        # 4. Tasks
        today_str = datetime.now().strftime("%Y-%m-%d")
        seed_tasks = [
            Task(
                employee_id=mgr.id,
                created_by_id=mgr.id,
                assigned_by_role="Self",
                project_name="Core Web Platform v3",
                title="Q4 Sprint Roadmap & Team Resource Allocation",
                description="Finalize quarterly milestones and assign upcoming tasks to tech leads.",
                priority="High",
                status="In Progress",
                assigned_date=today_str,
                due_date="2026-11-28"
            ),
            Task(
                employee_id=fe.id,
                created_by_id=mgr.id,
                assigned_by_role="Manager",
                project_name="Core Web Platform v3",
                title="Build Responsive Analytics Dashboard & Chart Widgets",
                description="Implement manager and employee analytics charts using responsive Tailwind layouts.",
                priority="High",
                status="In Progress",
                assigned_date=today_str,
                due_date="2026-11-27"
            ),
            Task(
                employee_id=fe.id,
                created_by_id=fe.id,
                assigned_by_role="Self",
                project_name="Core Web Platform v3",
                title="Refactor Modal Components and Accessibility Aria Labels",
                description="Audit UI for WCAG AA compliance and keyboard navigation focus states.",
                priority="Medium",
                status="Completed",
                assigned_date=today_str,
                due_date="2026-11-22"
            )
        ]
        db.add_all(seed_tasks)
        db.commit()

        # 5. Timesheets
        db.add(Timesheet(
            employee_id=fe.id,
            date="2026-11-24",
            project_name="Core Web Platform v3",
            work_description="Completed responsive header navigation and unified theme toggle.",
            hours_worked="8.0",
            created_at="2026-11-24 17:30"
        ))
        db.commit()

        # 6. Attendance
        for emp in [mgr, fe, be, qa]:
            db.add(Attendance(
                employee_id=emp.id,
                date=today_str,
                check_in="09:00 AM",
                check_out="05:30 PM",
                status="Present",
                work_hours="8.5 hrs"
            ))
        db.commit()

        # 7. Leaves
        db.add(Leave(
            employee_id=fe.id,
            leave_type="Casual Leave",
            start_date="2026-12-01",
            end_date="2026-12-02",
            days=2,
            reason="Family gathering in hometown",
            status="Pending"
        ))
        db.commit()

        print("Initial data seeded into database successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
