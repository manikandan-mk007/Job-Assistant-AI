from app.services.text_preprocessor import extract_key_phrases


def suggest_keywords(
    *,
    extracted_skills: list[str],
    missing_skills: list[str],
    description: str,
) -> list[str]:
    phrases = extract_key_phrases(description)

    candidates = []
    candidates.extend(missing_skills)
    candidates.extend(extracted_skills[:5])
    candidates.extend(phrases[:8])

    seen = set()
    result = []

    for item in candidates:
        cleaned = item.strip().lower()
        if cleaned and cleaned not in seen and len(cleaned) > 2:
            seen.add(cleaned)
            result.append(cleaned)

    return result[:10]