from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    target_role = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    resume_text = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")