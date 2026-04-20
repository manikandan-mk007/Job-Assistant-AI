const API_BASE = "http://127.0.0.1:8000/api/v1";

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const messageEl = document.getElementById("message");
const coverLetterText = document.getElementById("coverLetterText");

const params = new URLSearchParams(window.location.search);
const jobId = params.get("job_id");

async function getToken() {
  const data = await browser.storage.local.get("token");
  return data.token || null;
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  if (!token) throw new Error("Please login from popup first.");

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}

async function generateCoverLetter() {
  try {
    if (!jobId) throw new Error("Job id missing.");

    const data = await apiFetch(`/cover-letters/generate/${jobId}`, {
      method: "POST"
    });

    coverLetterText.value = data.generated_text || "";
    messageEl.textContent = "Cover letter generated.";
  } catch (error) {
    messageEl.textContent = error.message;
  }
}

async function copyCoverLetter() {
  try {
    await navigator.clipboard.writeText(coverLetterText.value);
    messageEl.textContent = "Copied to clipboard.";
  } catch (error) {
    messageEl.textContent = "Copy failed.";
  }
}

document.addEventListener("DOMContentLoaded", generateCoverLetter);
generateBtn.addEventListener("click", generateCoverLetter);
copyBtn.addEventListener("click", copyCoverLetter);