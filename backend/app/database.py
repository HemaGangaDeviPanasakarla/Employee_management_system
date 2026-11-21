"""
File: backend/app/database.py
Purpose: Configures PostgreSQL database connection using SQLAlchemy.
Key Components:
  - DATABASE_URL: Connects to PostgreSQL 18 on port 5433 using psycopg3 driver.
    Uses URL.create() to safely handle passwords with special characters (like '@').
  - engine: Manages actual connection pool to the PostgreSQL database.
  - SessionLocal: Database session factory for querying/saving data per request.
  - Base: Declarative base class for defining SQLAlchemy ORM models (tables).
"""

from sqlalchemy import create_engine, URL
from sqlalchemy.orm import declarative_base, sessionmaker

# Database connection configuration (PostgreSQL 18 on port 5433)
DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username="postgres",
    password="Hema@473",
    host="localhost",
    port=5433,
    database="employee_management"
)

# SQLAlchemy engine to manage DB connections
engine = create_engine(DATABASE_URL)

# SessionLocal creates fresh database sessions for each request
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all database models (defined in models.py)
Base = declarative_base()
