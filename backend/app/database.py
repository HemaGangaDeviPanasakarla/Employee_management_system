"""
File: backend/app/database.py
Purpose: Configures database connection with PostgreSQL primary and SQLite resilient fallback.
All credentials are read from environment variables or .env file (NO hardcoded credentials).
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, URL
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from backend/.env if present
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(env_path)

# Database connection configuration from environment variables
POSTGRES_USER = os.environ.get("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "")
POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "localhost")
POSTGRES_PORT = int(os.environ.get("POSTGRES_PORT", "5432"))
POSTGRES_DB = os.environ.get("POSTGRES_DB", "employee_management")

POSTGRES_URL = URL.create(
    drivername="postgresql+psycopg",
    username=POSTGRES_USER,
    password=POSTGRES_PASSWORD,
    host=POSTGRES_HOST,
    port=POSTGRES_PORT,
    database=POSTGRES_DB
)

Base = declarative_base()

USE_POSTGRES = os.environ.get("USE_POSTGRES", "0").lower() in ("1", "true", "yes")

def get_engine():
    # If postgres is enabled via environment, connect to PostgreSQL
    if USE_POSTGRES and POSTGRES_PASSWORD:
        try:
            pg_engine = create_engine(
                POSTGRES_URL,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 2}
            )
            with pg_engine.connect() as conn:
                pass
            print(f"Connected to PostgreSQL successfully at {POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}.")
            return pg_engine
        except Exception as e:
            print(f"PostgreSQL connection failed ({e}), falling back to persistent SQLite.")

    # Resilient persistent SQLite database
    db_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(db_dir, "employee_management.db")
    return create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False}
    )

engine = get_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
