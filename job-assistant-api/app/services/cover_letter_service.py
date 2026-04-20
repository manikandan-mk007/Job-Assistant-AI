def generate_cover_letter(
    *,
    user_name: str,
    target_role: str | None,
    skills: str | None,
    projects: str | None,
    job_title: str,
    company: str,
    matched_skills: list[str],
    missing_skills: list[str],
) -> str:
    matched_text = ", ".join(matched_skills) if matched_skills else "relevant technical skills"
    skills_text = skills or "technical skills"
    project_text = projects or "academic and personal projects"
    target_role_text = target_role or "developer"

    gap_line = ""
    if missing_skills:
        gap_line = (
            f" I also understand that this role values {', '.join(missing_skills[:3])}, "
            f"and I am actively strengthening those areas."
        )

    return f"""Dear Hiring Manager,

I am excited to apply for the {job_title} position at {company}. As an aspiring {target_role_text}, I have built a strong foundation through hands-on work in {skills_text} and project experience including {project_text}.

My background aligns with several important requirements for this role, particularly {matched_text}. Through my project work, I have developed practical problem-solving ability, debugging experience, and a strong interest in building real-world solutions.{gap_line}

I am eager to contribute, learn quickly, and grow within your team. I would welcome the opportunity to discuss how my background, enthusiasm, and project experience can support {company}.

Sincerely,
{user_name}"""