from pydantic import BaseModel


class AnalyticsDashboardResponse(BaseModel):
    total_jobs: int
    saved_jobs: int
    applied_jobs: int
    interview_jobs: int
    rejected_jobs: int
    average_score: float
    top_missing_skills: list[str]