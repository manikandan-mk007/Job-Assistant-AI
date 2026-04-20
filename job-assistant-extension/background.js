browser.runtime.onInstalled.addListener(() => {
  console.log("AI Job Assistant V3 installed");
});

browser.runtime.onMessage.addListener((message) => {
  if (!message?.type) return;

  if (message.type === "OPEN_OPTIONS") {
    browser.runtime.openOptionsPage();
  }

  if (message.type === "OPEN_SAVED") {
    browser.tabs.create({ url: browser.runtime.getURL("saved/saved.html") });
  }

  if (message.type === "OPEN_RESUME") {
    browser.tabs.create({ url: browser.runtime.getURL("resume/resume.html") });
  }

  if (message.type === "OPEN_COVER_LETTER" && message.jobId) {
    browser.tabs.create({
      url: browser.runtime.getURL(`cover-letter/cover-letter.html?job_id=${message.jobId}`)
    });
  }
});