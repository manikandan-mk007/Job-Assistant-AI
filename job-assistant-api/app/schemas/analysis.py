from pydantic import BaseModel


class AnalyzeJobRequest(BaseModel):
    title: str
    company: str
    location: str | None = None
    url: str
    description: str


class AnalyzeJobResponse(BaseModel):
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