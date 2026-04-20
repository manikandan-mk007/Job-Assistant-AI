from datetime import datetime
from pydantic import BaseModel


class SaveJobRequest(BaseModel):
    title: str
    company: str
    location: str | None = None
    url: str
    description: str
    extracted_skills: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    suggested_keywords: list[str]
    semantic_score: float
    skill_score: float
    role_score: float
    project_score: float
    resume_score: float
    final_score: float
    recommendation: str


class UpdateJobStatusRequest(BaseModel):
    status: str


class SavedJobOut(BaseModel):
    id: int
    title: str
    company: str
    location: str | None = None
    url: str
    description: str
    extracted_skills: str | None = None
    matched_skills: str | None = None
    missing_skills: str | None = None
    suggested_keywords: str | None = None
    semantic_score: float
    skill_score: float
    role_score: float
    project_score: float
    resume_score: float
    final_score: float
    recommendation: str | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}