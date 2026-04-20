from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(Text, nullable=False)
    company = Column(Text, nullable=False)
    location = Column(Text, nullable=True)
    url = Column(Text, nullable=False)
    description = Column(Text, nullable=False)

    extracted_skills = Column(Text, nullable=True)
    matched_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    suggested_keywords = Column(Text, nullable=True)

    semantic_score = Column(Float, default=0.0)
    skill_score = Column(Float, default=0.0)
    role_score = Column(Float, default=0.0)
    project_score = Column(Float, default=0.0)
    resume_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)

    recommendation = Column(Text, nullable=True)
    status = Column(Text, default="saved")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")
    cover_letter = relationship("CoverLetter", back_populates="job", uselist=False, cascade="all, delete-orphan")