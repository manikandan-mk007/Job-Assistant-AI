const API_BASE = "https://job-assistant-ai-t1no.onrender.com/api/v1";

const resumeFileInput = document.getElementById("resumeFile");
const uploadBtn = document.getElementById("uploadBtn");
const messageEl = document.getElementById("message");
const resumeTextEl = document.getElementById("resumeText");

async function getToken() {
  const data = await browser.storage.local.get("token");
  return data.token || null;
}

async function uploadResume() {
  try {
    const token = await getToken();
    if (!token) throw new Error("Please login from popup first.");

    const file = resumeFileInput.files[0];
    if (!file) throw new Error("Choose a PDF or DOCX file.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/resume/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || "Upload failed");
    }

    messageEl.textContent = data.message;
    resumeTextEl.value = data.extracted_text || "";
  } catch (error) {
    messageEl.textContent = error.message;
  }
}

uploadBtn.addEventListener("click", uploadResume);