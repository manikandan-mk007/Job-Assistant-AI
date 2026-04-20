const API_BASE = "http://127.0.0.1:8000/api/v1";

const targetRoleInput = document.getElementById("targetRole");
const skillsInput = document.getElementById("skills");
const educationInput = document.getElementById("education");
const projectsInput = document.getElementById("projects");
const summaryInput = document.getElementById("summary");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const messageEl = document.getElementById("message");
const openResumeBtn = document.getElementById("openResumeBtn");
const openSavedBtn = document.getElementById("openSavedBtn");

async function getToken() {
  const data = await browser.storage.local.get("token");
  return data.token || null;
}

async function apiFetch(path, options = {}) {
  const token = await getToken();

  if (!token) {
    throw new Error("Please login from popup first.");
  }

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

async function loadProfile() {
  try {
    const data = await apiFetch("/profiles/me", { method: "GET" });

    if (!data) return;

    targetRoleInput.value = data.target_role || "";
    skillsInput.value = data.skills || "";
    educationInput.value = data.education || "";
    projectsInput.value = data.projects || "";
    summaryInput.value = data.summary || "";
  } catch (error) {
    messageEl.textContent = error.message;
  }
}

async function saveProfile() {
  try {
    await apiFetch("/profiles/me", {
      method: "POST",
      body: JSON.stringify({
        target_role: targetRoleInput.value.trim(),
        skills: skillsInput.value.trim(),
        education: educationInput.value.trim(),
        projects: projectsInput.value.trim(),
        summary: summaryInput.value.trim()
      })
    });

    messageEl.textContent = "Profile saved successfully.";
  } catch (error) {
    messageEl.textContent = error.message;
  }
}

saveProfileBtn.addEventListener("click", saveProfile);

openResumeBtn.addEventListener("click", () => {
  browser.runtime.sendMessage({ type: "OPEN_RESUME" });
});

openSavedBtn.addEventListener("click", () => {
  browser.runtime.sendMessage({ type: "OPEN_SAVED" });
});

document.addEventListener("DOMContentLoaded", loadProfile);