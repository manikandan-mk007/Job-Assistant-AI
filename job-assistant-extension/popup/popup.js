const API_BASE = "https://job-assistant-ai-t1no.onrender.com/api/v1";

const authCard = document.getElementById("authCard");
const userCard = document.getElementById("userCard");
const loadingCard = document.getElementById("loadingCard");
const jobCard = document.getElementById("jobCard");
const analysisCard = document.getElementById("analysisCard");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const saveJobBtn = document.getElementById("saveJobBtn");
const coverLetterBtn = document.getElementById("coverLetterBtn");
const savedBtn = document.getElementById("savedBtn");
const resumeBtn = document.getElementById("resumeBtn");
const settingsBtn = document.getElementById("settingsBtn");

const authMessage = document.getElementById("authMessage");
const statusMessage = document.getElementById("statusMessage");
const welcomeText = document.getElementById("welcomeText");
const jobInfo = document.getElementById("jobInfo");
const analysisInfo = document.getElementById("analysisInfo");

let currentJob = null;
let currentAnalysis = null;
let lastSavedJobId = null;

function show(el) {
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTags(items, className = "") {
  if (!items || !items.length) return `<p class="muted">None</p>`;
  return `<div class="tag-list">${items.map((item) => `<span class="tag ${className}">${escapeHtml(item)}</span>`).join("")}</div>`;
}

function setMessage(text) {
  statusMessage.textContent = text || "";
}

async function getStoredAuth() {
  const data = await browser.storage.local.get(["token", "user"]);
  return {
    token: data.token || null,
    user: data.user || null
  };
}

async function setStoredAuth(token, user) {
  await browser.storage.local.set({ token, user });
}

async function clearStoredAuth() {
  await browser.storage.local.remove(["token", "user"]);
}

async function apiFetch(path, options = {}) {
  const { token } = await getStoredAuth();

  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}

async function fetchCurrentUser() {
  const user = await apiFetch("/auth/me", { method: "GET" });
  const { token } = await getStoredAuth();
  await setStoredAuth(token, user);
  return user;
}

async function refreshUI() {
  const { token, user } = await getStoredAuth();

  if (token && user) {
    hide(authCard);
    show(userCard);
    welcomeText.textContent = `Welcome, ${user.name}`;
  } else {
    show(authCard);
    hide(userCard);
  }
}

async function login() {
  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      authMessage.textContent = "Enter email and password.";
      return;
    }

    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    await browser.storage.local.set({ token: data.access_token });
    await fetchCurrentUser();
    authMessage.textContent = "Login successful.";
    await refreshUI();
  } catch (error) {
    authMessage.textContent = error.message;
  }
}

async function register() {
  try {
    const name = nameInput.value.trim() || "User";
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      authMessage.textContent = "Enter name, email, and password.";
      return;
    }

    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    authMessage.textContent = "Registration successful. Now login.";
  } catch (error) {
    authMessage.textContent = error.message;
  }
}

async function analyzeCurrentJob() {
  try {
    currentJob = null;
    currentAnalysis = null;
    lastSavedJobId = null;
    setMessage("");

    hide(jobCard);
    hide(analysisCard);
    show(loadingCard);

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    if (!activeTab?.id || !activeTab.url?.includes("linkedin.com/jobs")) {
      throw new Error("Open a LinkedIn job page first.");
    }

    const jobData = await browser.tabs.sendMessage(activeTab.id, { type: "GET_JOB_DATA" });

    if (!jobData || !jobData.title || !jobData.description) {
      throw new Error("Could not extract full job data from this page.");
    }

    currentJob = jobData;

    jobInfo.innerHTML = `
      <div class="meta"><strong>${escapeHtml(jobData.title)}</strong></div>
      <div class="meta">${escapeHtml(jobData.company || "Unknown company")}</div>
      <div class="meta">${escapeHtml(jobData.location || "Location not found")}</div>
    `;
    show(jobCard);

    const analysis = await apiFetch("/analysis/analyze-job", {
      method: "POST",
      body: JSON.stringify(jobData)
    });

    currentAnalysis = analysis;

    analysisInfo.innerHTML = `
      <div class="score">${analysis.final_score}%</div>
      <div class="meta"><strong>Recommendation:</strong> ${escapeHtml(analysis.recommendation)}</div>

      <div class="label">Matched Skills</div>
      ${renderTags(analysis.matched_skills)}

      <div class="label">Missing Skills</div>
      ${renderTags(analysis.missing_skills, "missing")}

      <div class="label">Suggested Keywords</div>
      ${renderTags(analysis.suggested_keywords, "keyword")}

      <div class="label">Extracted Job Skills</div>
      ${renderTags(analysis.extracted_skills)}

      <div class="label">Score Breakdown</div>
      <div class="meta">Skill Score: ${analysis.skill_score}%</div>
      <div class="meta">Semantic Score: ${analysis.semantic_score}%</div>
      <div class="meta">Role Score: ${analysis.role_score}%</div>
      <div class="meta">Project Score: ${analysis.project_score}%</div>
      <div class="meta">Resume Score: ${analysis.resume_score}%</div>
    `;
    show(analysisCard);
  } catch (error) {
    setMessage(error.message);
  } finally {
    hide(loadingCard);
  }
}

async function saveCurrentJob() {
  try {
    if (!currentJob || !currentAnalysis) {
      throw new Error("Analyze a job first.");
    }

    const payload = {
      ...currentJob,
      extracted_skills: currentAnalysis.extracted_skills,
      matched_skills: currentAnalysis.matched_skills,
      missing_skills: currentAnalysis.missing_skills,
      suggested_keywords: currentAnalysis.suggested_keywords,
      semantic_score: currentAnalysis.semantic_score,
      skill_score: currentAnalysis.skill_score,
      role_score: currentAnalysis.role_score,
      project_score: currentAnalysis.project_score,
      resume_score: currentAnalysis.resume_score,
      final_score: currentAnalysis.final_score,
      recommendation: currentAnalysis.recommendation
    };

    const saved = await apiFetch("/jobs/save", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    lastSavedJobId = saved.id;
    setMessage("Job saved successfully.");
  } catch (error) {
    setMessage(error.message);
  }
}

async function openCoverLetter() {
  try {
    if (!lastSavedJobId) {
      throw new Error("Save the analyzed job first.");
    }

    await browser.runtime.sendMessage({
      type: "OPEN_COVER_LETTER",
      jobId: lastSavedJobId
    });
  } catch (error) {
    setMessage(error.message);
  }
}

async function logout() {
  await clearStoredAuth();
  currentJob = null;
  currentAnalysis = null;
  lastSavedJobId = null;
  jobInfo.innerHTML = "";
  analysisInfo.innerHTML = "";
  hide(jobCard);
  hide(analysisCard);
  setMessage("");
  authMessage.textContent = "";
  await refreshUI();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { token } = await getStoredAuth();
    if (token) {
      try {
        await fetchCurrentUser();
      } catch {
        await clearStoredAuth();
      }
    }
    await refreshUI();
  } catch (error) {
    console.error(error);
  }
});

loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
logoutBtn.addEventListener("click", logout);
analyzeBtn.addEventListener("click", analyzeCurrentJob);
saveJobBtn.addEventListener("click", saveCurrentJob);
coverLetterBtn.addEventListener("click", openCoverLetter);

savedBtn.addEventListener("click", () => {
  browser.runtime.sendMessage({ type: "OPEN_SAVED" });
});

resumeBtn.addEventListener("click", () => {
  browser.runtime.sendMessage({ type: "OPEN_RESUME" });
});

settingsBtn.addEventListener("click", () => {
  browser.runtime.sendMessage({ type: "OPEN_OPTIONS" });
});