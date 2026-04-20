import re
import spacy

nlp = spacy.load("en_core_web_sm")


def normalize_text(text: str) -> str:
    return " ".join(text.lower().strip().split())


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s\-\./+]", " ", text)
    return normalize_text(text)


def preprocess_text(text: str) -> str:
    cleaned = clean_text(text)
    doc = nlp(cleaned)

    tokens = []
    for token in doc:
        if token.is_stop or token.is_punct or token.is_space:
            continue
        lemma = token.lemma_.strip().lower()
        if lemma:
            tokens.append(lemma)

    return " ".join(tokens)


def extract_key_phrases(text: str) -> list[str]:
    cleaned = clean_text(text)
    doc = nlp(cleaned)

    phrases = set()

    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip().lower()
        if len(phrase) > 2:
            phrases.add(phrase)

    return sorted(phrases)