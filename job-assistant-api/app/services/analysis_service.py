from app.services.keyword_suggester import suggest_keywords
from app.services.skill_extractor import extract_skills_from_text, normalize_skill
from app.services.similarity_engine import compute_tfidf_cosine_similarity
from app.services.text_preprocessor import preprocess_text


def text_to_skill_list(skills_text: str | None) -> list[str]:
    if not skills_text:
        return []

    raw_skills = [item.strip() for item in skills_text.split(",") if item.strip()]
    return sorted({normalize_skill(skill) for skill in raw_skills})


def compute_skill_score(user_skills: list[str], job_skills: list[str]) -> tuple[float, list[str], list[str]]:
    user_skills_set = set(user_skills)
    job_skills_set = set(job_skills)

    matched = sorted(user_skills_set.intersection(job_skills_set))
    missing = sorted(job_skills_set.difference(user_skills_set))

    if not job_skills_set:
        return 0.0, matched, missing

    score = (len(matched) / len(job_skills_set)) * 100
    return round(score, 2), matched, missing


def compute_role_score(target_role: str | None, job_title: str) -> float:
    if not target_role or not job_title:
        return 0.0

    target_words = set(target_role.lower().split())
    title_words = set(job_title.lower().split())

    if not target_words or not title_words:
        return 0.0

    overlap = target_words.intersection(title_words)
    score = (len(overlap) / len(title_words)) * 100
    return round(score, 2)


def compute_project_score(projects: str | None, description: str) -> float:
    if not projects or not description:
        return 0.0

    processed_projects = preprocess_text(projects)
    processed_description = preprocess_text(description)
    return compute_tfidf_cosine_similarity(processed_projects, processed_description)


def compute_resume_score(resume_text: str | None, description: str) -> float:
    if not resume_text or not description:
        return 0.0

    processed_resume = preprocess_text(resume_text)
    processed_description = preprocess_text(description)
    return compute_tfidf_cosine_similarity(processed_resume, processed_description)


def get_recommendation(final_score: float) -> str:
    if final_score >= 75:
        return "Strong match"
    if final_score >= 55:
        return "Moderate match"
    if final_score >= 35:
        return "Low match"
    return "Not suitable for your current profile"


def analyze_job_against_profile(
    *,
    target_role: str | None,
    skills_text: str | None,
    projects: str | None,
    resume_text: str | None,
    job_title: str,
    job_description: str,
) -> dict:
    user_skills = text_to_skill_list(skills_text)
    extracted_job_skills = extract_skills_from_text(job_description)

    skill_score, matched_skills, missing_skills = compute_skill_score(
        user_skills=user_skills,
        job_skills=extracted_job_skills
    )

    processed_profile_text = preprocess_text(
        f"{target_role or ''} {skills_text or ''} {projects or ''} {resume_text or ''}"
    )
    processed_job_text = preprocess_text(f"{job_title} {job_description}")

    semantic_score = compute_tfidf_cosine_similarity(processed_profile_text, processed_job_text)
    role_score = compute_role_score(target_role, job_title)
    project_score = compute_project_score(projects, job_description)
    resume_score = compute_resume_score(resume_text, job_description)

    final_score = (
        skill_score * 0.40 +
        semantic_score * 0.25 +
        role_score * 0.15 +
        project_score * 0.10 +
        resume_score * 0.10
    )

    suggested_keywords = suggest_keywords(
        extracted_skills=extracted_job_skills,
        missing_skills=missing_skills,
        description=job_description,
    )

    final_score = round(final_score, 2)
    recommendation = get_recommendation(final_score)

    return {
        "extracted_skills": extracted_job_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggested_keywords": suggested_keywords,
        "semantic_score": round(semantic_score, 2),
        "skill_score": round(skill_score, 2),
        "role_score": round(role_score, 2),
        "project_score": round(project_score, 2),
        "resume_score": round(resume_score, 2),
        "final_score": final_score,
        "recommendation": recommendation,
    }