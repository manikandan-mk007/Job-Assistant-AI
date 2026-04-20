console.log("AI Job Assistant content loaded:", window.location.href);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTextFromSelectors(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText && el.innerText.trim()) {
      return el.innerText.trim();
    }
  }
  return "";
}

function clickSeeMoreButtons() {
  const selectors = [
    "button[aria-label*='See more description']",
    "button[aria-label*='Click to see more description']",
    ".jobs-description__footer-button",
    ".inline-show-more-text__button",
    "button[aria-expanded='false']"
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((btn) => {
      try {
        if (btn && btn.offsetParent !== null) btn.click();
      } catch (error) {
        console.warn("See more click failed", error);
      }
    });
  });
}

function extractDescription() {
  const selectors = [
    ".show-more-less-html__markup",
    ".jobs-description__content",
    ".jobs-box__html-content",
    ".jobs-description-content__text",
    "#job-details"
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText && el.innerText.trim().length > 80) {
      return el.innerText.trim();
    }
  }

  const blocks = [...document.querySelectorAll("div, section, article")]
    .map((el) => el.innerText?.trim())
    .filter(Boolean)
    .filter((text) => text.length > 300)
    .filter((text) => {
      const lower = text.toLowerCase();
      return (
        lower.includes("about the job") ||
        lower.includes("responsibilities") ||
        lower.includes("qualifications") ||
        lower.includes("requirements") ||
        lower.includes("job description") ||
        lower.includes("pay rate")
      );
    });

  return blocks[0] || "";
}

async function extractLinkedInJobData() {
  clickSeeMoreButtons();
  await sleep(1000);

  const title = getTextFromSelectors([
    "h1",
    ".job-details-jobs-unified-top-card__job-title",
    ".jobs-unified-top-card__job-title",
    ".t-24"
  ]);

  const company = getTextFromSelectors([
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name",
    "a[href*='/company/']"
  ]);

  const location = getTextFromSelectors([
    ".job-details-jobs-unified-top-card__bullet",
    ".jobs-unified-top-card__bullet",
    ".job-details-jobs-unified-top-card__primary-description-container",
    ".jobs-unified-top-card__subtitle-primary-grouping",
    ".tvm__text--low-emphasis"
  ]);

  const description = extractDescription();

  return {
    title,
    company,
    location,
    description,
    url: window.location.href
  };
}

browser.runtime.onMessage.addListener((request) => {
  if (request?.type === "GET_JOB_DATA") {
    return extractLinkedInJobData();
  }
});