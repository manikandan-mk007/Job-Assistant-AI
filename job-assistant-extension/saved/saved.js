const API_BASE = "http://127.0.0.1:8000/api/v1";

const analyticsInfo = document.getElementById("analyticsInfo");
const jobsList = document.getElementById("jobsList");
const messageEl = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let allJobs = [];

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

function splitCsv(text) {
  if (!text) return [];
  return text.split(",").map((item) => item.trim()).filter(Boolean);
}

function renderAnalytics(data) {
  analyticsInfo.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-box">
        <div class="analytics-value">${data.total_jobs}</div>
        <div class="analytics-label">Total Jobs</div>
      </div>
      <div class="analytics-box">
        <div class="analytics-value">${data.applied_jobs}</div>
        <div class="analytics-label">Applied</div>
      </div>
      <div class="analytics-box">
        <div class="analytics-value">${data.interview_jobs}</div>
        <div class="analytics-label">Interview</div>
      </div>
      <div class="analytics-box">
        <div class="analytics-value">${data.rejected_jobs}</div>
        <div class="analytics-label">Rejected</div>
      </div>
      <div class="analytics-box">
        <div class="analytics-value">${data.average_score}%</div>
        <div class="analytics-label">Average Score</div>
      </div>
      <div class="analytics-box">
        <div class="analytics-value">${data.top_missing_skills.length}</div>
        <div class="analytics-label">Top Missing Skills</div>
      </div>
    </div>
    <div class="row">
      ${data.top_missing_skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
    </div>
  `;
}

function renderJob(job) {
  const keywords = splitCsv(job.suggested_keywords);
  const matchedSkills = splitCsv(job.matched_skills);

  return `
    <div class="job-card" data-id="${job.id}">
      <div class="job-title">${job.title}</div>
      <div class="meta">${job.company} • ${job.location || "Location not found"}</div>
      <div class="meta"><strong>Recommendation:</strong> ${job.recommendation || "N/A"}</div>
      <div class="score">${job.final_score}%</div>

      <div class="row">
        ${matchedSkills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
      </div>

      <div class="row">
        ${keywords.map((item) => `<span class="tag keyword">${item}</span>`).join("")}
      </div>

      <div class="row">
        <select data-status-select>
          <option value="saved" ${job.status === "saved" ? "selected" : ""}>Saved</option>
          <option value="applied" ${job.status === "applied" ? "selected" : ""}>Applied</option>
          <option value="interview" ${job.status === "interview" ? "selected" : ""}>Interview</option>
          <option value="rejected" ${job.status === "rejected" ? "selected" : ""}>Rejected</option>
        </select>
        <button data-update-status>Update Status</button>
        <button data-cover-letter class="secondary">Cover Letter</button>
        <a href="${job.url}" target="_blank" rel="noopener noreferrer">Open Job</a>
      </div>
    </div>
  `;
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = allJobs.filter((job) => {
    const matchesQuery =
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query);

    const matchesStatus = !selectedStatus || job.status === selectedStatus;

    return matchesQuery && matchesStatus;
  });

  if (!filtered.length) {
    jobsList.innerHTML = "<p>No jobs match your filter.</p>";
    return;
  }

  jobsList.innerHTML = filtered.map(renderJob).join("");
}

async function loadAnalytics() {
  const data = await apiFetch("/analytics/dashboard", { method: "GET" });
  renderAnalytics(data);
}

async function loadJobs() {
  allJobs = await apiFetch("/jobs", { method: "GET" });
  applyFilters();
}

async function updateJobStatus(jobId, status) {
  await apiFetch(`/jobs/${jobId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });

  messageEl.textContent = "Status updated.";
  await loadAnalytics();
  await loadJobs();
}

jobsList.addEventListener("click", async (event) => {
  const statusBtn = event.target.closest("[data-update-status]");
  const coverBtn = event.target.closest("[data-cover-letter]");

  if (statusBtn) {
    const card = statusBtn.closest(".job-card");
    const jobId = card.dataset.id;
    const status = card.querySelector("[data-status-select]").value;
    await updateJobStatus(jobId, status);
    return;
  }

  if (coverBtn) {
    const card = coverBtn.closest(".job-card");
    const jobId = Number(card.dataset.id);
    await browser.runtime.sendMessage({
      type: "OPEN_COVER_LETTER",
      jobId
    });
  }
});

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadAnalytics();
    await loadJobs();
  } catch (error) {
    messageEl.textContent = error.message;
  }
});