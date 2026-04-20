KNOWN_SKILLS = [
    "python",
    "django",
    "fastapi",
    "flask",
    "react",
    "javascript",
    "typescript",
    "html",
    "css",
    "mysql",
    "sql",
    "postgresql",
    "mongodb",
    "git",
    "github",
    "docker",
    "aws",
    "linux",
    "bootstrap",
    "tailwind",
    "rest api",
    "api",
    "machine learning",
    "nlp",
    "pandas",
    "numpy",
    "scikit-learn",
    "data analysis",
    "data science",
    "power bi",
    "excel",
    "java",
    "spring boot",
    "node.js",
    "express",
    "jwt",
    "authentication",
    "authorization",
    "oop",
    "problem solving",
    "communication",
    "teamwork",
    "testing",
    "debugging",
    "deployment",
    "ci/cd",
    "azure",
    "firebase",
]

SKILL_ALIASES = {
    "nodejs": "node.js",
    "restful api": "rest api",
    "restful apis": "rest api",
    "apis": "api",
    "js": "javascript",
    "ts": "typescript",
    "postgres": "postgresql",
    "ml": "machine learning",
}


def normalize_skill(skill: str) -> str:
    skill = skill.strip().lower()
    return SKILL_ALIASES.get(skill, skill)


def extract_skills_from_text(text: str) -> list[str]:
    text_lower = text.lower()
    found_skills = set()

    for skill in KNOWN_SKILLS:
        if skill in text_lower:
            found_skills.add(skill)

    for alias, canonical in SKILL_ALIASES.items():
        if alias in text_lower:
            found_skills.add(canonical)

    return sorted(found_skills)