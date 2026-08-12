from __future__ import annotations
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, JSON, Boolean, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from config.database import Base
from typing import Optional

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True) # Matches Supabase auth user ID
    username: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    role: Mapped[str] = mapped_column(String, default="candidate")  # "candidate" or "recruiter"
    company_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # For recruiters
    urls: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped["Profile"] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    matches: Mapped[list["Match"]] = relationship("Match", back_populates="user", cascade="all, delete-orphan")
    job_postings: Mapped[list["JobPosting"]] = relationship("JobPosting", back_populates="recruiter", cascade="all, delete-orphan")
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    skills: Mapped[list] = mapped_column(JSON, default=list)
    education: Mapped[list] = mapped_column(JSON, default=list)
    experience: Mapped[list] = mapped_column(JSON, default=list)
    projects: Mapped[list] = mapped_column(JSON, default=list)
    saved_internships: Mapped[list] = mapped_column(JSON, default=list)

    user: Mapped["User"] = relationship("User", back_populates="profile")

class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, nullable=False)
    skills: Mapped[list] = mapped_column(JSON, default=list)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    stipend: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # New Hybrid Filtering Columns
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False)
    stipend_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    duration_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    constraints: Mapped[dict] = mapped_column(JSON, default=dict)

    url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    matches: Mapped[list["Match"]] = relationship("Match", back_populates="job", cascade="all, delete-orphan")

class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    matched_skills: Mapped[list] = mapped_column(JSON, default=list)
    missing_skills: Mapped[list] = mapped_column(JSON, default=list)

    user: Mapped["User"] = relationship("User", back_populates="matches")
    job: Mapped["Job"] = relationship("Job", back_populates="matches")

class TailoredResume(Base):
    __tablename__ = "tailored_resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    profile_version_hash: Mapped[str] = mapped_column(String, nullable=False)
    tailored_json: Mapped[dict] = mapped_column(JSON, default=dict)
    ats_score_before: Mapped[float] = mapped_column(Float, nullable=False)
    ats_score_after: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User")
    job: Mapped["Job"] = relationship("Job")


class JobPosting(Base):
    """Recruiter-created job listings."""
    __tablename__ = "job_postings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    recruiter_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    skills_required: Mapped[list] = mapped_column(JSON, default=list)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    salary_range: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    job_type: Mapped[str] = mapped_column(String, default="internship")  # "full-time", "internship", "part-time"
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recruiter: Mapped["User"] = relationship("User", back_populates="job_postings")
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="job_posting", cascade="all, delete-orphan")


class Application(Base):
    """Candidate applications to recruiter-posted jobs."""
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_posting_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String, default="applied")  # "applied", "reviewed", "shortlisted", "rejected"
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    candidate: Mapped["User"] = relationship("User", back_populates="applications")
    job_posting: Mapped["JobPosting"] = relationship("JobPosting", back_populates="applications")
