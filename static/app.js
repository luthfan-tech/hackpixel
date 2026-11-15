/**
 * Hackpixel - Frontend Application Logic
 * Integrates form validation, 422 field-error placement, card rendering,
 * simplified sorting/filtering, localStorage recent ideas, system status strip,
 * and Buy Me a Coffee support configuration.
 */

// Buy Me a Coffee link configuration
const BMC_URL = "https://buymeacoffee.com/luthfanmakl";

// Application State
let currentIdeas = [];
let rubricWeights = {};
let currentFilteredIdeas = [];
let currentPage = 1;
let pageSize = 3;

// DOM Elements: Form
const form = document.getElementById("ideasForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const errorBanner = document.getElementById("errorBanner");
const errorTitle = document.getElementById("errorTitle");
const errorList = document.getElementById("errorList");

// DOM Elements: Results
const resultsStatus = document.getElementById("resultsStatus");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const resultsControls = document.getElementById("resultsControls");
const ideasList = document.getElementById("ideasList");
const sortSelect = document.getElementById("sortSelect");
const filterStack = document.getElementById("filterStack");

// DOM Elements: Pagination
const paginationControls = document.getElementById("paginationControls");
const pageInfoText = document.getElementById("pageInfoText");
const firstPageBtn = document.getElementById("firstPageBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const pageNumbersContainer = document.getElementById("pageNumbersContainer");
const nextPageBtn = document.getElementById("nextPageBtn");
const lastPageBtn = document.getElementById("lastPageBtn");
const pageSizeSelect = document.getElementById("pageSizeSelect");

// DOM Elements: Recent Ideas
const recentSection = document.getElementById("recentSection");
const recentList = document.getElementById("recentList");
const recentEmpty = document.getElementById("recentEmpty");
const clearRecentBtn = document.getElementById("clearRecentBtn");

// DOM Elements: Status Strip & Footer
const statusMode = document.getElementById("statusMode");
const statusIdeasCount = document.getElementById("statusIdeasCount");
const statusLastRun = document.getElementById("statusLastRun");
const bmcBtn = document.getElementById("bmcBtn");
const copyrightYear = document.getElementById("copyrightYear");

// DOM Elements: Enhancements, Presets & Bloom
const exportMarkdownBtn = document.getElementById("exportMarkdownBtn");
const copyToast = document.getElementById("copyToast");
const pixelBloomCanvas = document.getElementById("pixelBloomCanvas");
const presetButtons = document.querySelectorAll(".btn-preset");

// ==============================================================================
// Initialization
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  form.addEventListener("submit", handleFormSubmit);
  sortSelect.addEventListener("change", () => applySortAndFilter(true));
  filterStack.addEventListener("input", () => applySortAndFilter(true));
  clearRecentBtn.addEventListener("click", handleClearRecent);

  // Pagination controls
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", handlePageSizeChange);
  }
  if (firstPageBtn) {
    firstPageBtn.addEventListener("click", () => goToPage(1));
  }
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => goToPage(currentPage - 1));
  }
  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => goToPage(currentPage + 1));
  }
  if (lastPageBtn) {
    lastPageBtn.addEventListener("click", () => {
      const pageInfo = HackpixelHelpers.paginate(currentFilteredIdeas, currentPage, pageSize);
      goToPage(pageInfo.totalPages);
    });
  }

  // Preset buttons (Jamstack, AI Native, Mobile, Data Story, Edge)
  const presetBtns = document.querySelectorAll(".btn-preset");
  if (presetBtns && presetBtns.length > 0) {
    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => handleApplyPreset(btn.dataset.preset));
    });
  }

  // Export Markdown button
  if (exportMarkdownBtn) {
    exportMarkdownBtn.addEventListener("click", handleExportAllMarkdown);
  }

  // Initialize Buy Me a Coffee button link
  if (bmcBtn) {
    bmcBtn.href = BMC_URL;
  }

  // Initialize dynamic copyright year
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  // Load initial recent ideas and populate system status strip
  renderRecentIdeas();
  updateStatusStrip();
});

// ==============================================================================
// System Status Strip Updater
// ==============================================================================
async function updateStatusStrip() {
  // 1. Current mode from read-only backend status endpoint
  if (statusMode) {
    try {
      const response = await fetch("/api/status");
      if (response.ok) {
        const data = await response.json();
        statusMode.textContent = `[${data.mode}]`;
        if (data.mock_mode) {
          statusMode.style.color = "var(--color-accent-primary)";
        } else {
          statusMode.style.color = "var(--color-secondary)";
        }
      } else {
        statusMode.textContent = "[Offline]";
      }
    } catch {
      statusMode.textContent = "[Unknown]";
    }
  }

  // 2. Ideas count from browser localStorage
  const recentEntries = HackpixelHelpers.getRecentIdeas();
  if (statusIdeasCount) {
    statusIdeasCount.textContent = recentEntries.length.toString();
  }

  // 3. Last generation timestamp from most recent entry
  if (statusLastRun) {
    if (recentEntries.length > 0 && recentEntries[0].date) {
      statusLastRun.textContent = recentEntries[0].date;
    } else {
      statusLastRun.textContent = "None recorded";
    }
  }
}

// ==============================================================================
// Error Handling: Banner + Field-Level Errors (422)
// ==============================================================================
function clearAllErrors() {
  errorBanner.classList.add("hidden");
  errorList.innerHTML = "";

  // Clear all inline field error messages
  const fieldErrors = document.querySelectorAll(".field-error-msg");
  fieldErrors.forEach((el) => {
    el.textContent = "";
    el.classList.add("hidden");
  });

  const invalidInputs = document.querySelectorAll(".is-invalid");
  invalidInputs.forEach((el) => el.classList.remove("is-invalid"));
}

function showFieldErrors(fieldMap) {
  // fieldMap is an object: { field_name: "Error message" }
  for (const [field, message] of Object.entries(fieldMap)) {
    const errorEl = document.getElementById(`err-${field}`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove("hidden");
    }

    const inputEl = document.querySelector(`[name="${field}"]`);
    if (inputEl) {
      inputEl.classList.add("is-invalid");
    }
  }
}

function showSummaryErrors(title, errors = []) {
  errorTitle.textContent = title;
  errorList.innerHTML = "";

  if (Array.isArray(errors) && errors.length > 0) {
    errors.forEach((err) => {
      const li = document.createElement("li");
      li.textContent = err;
      errorList.appendChild(li);
    });
  } else if (typeof errors === "string") {
    const li = document.createElement("li");
    li.textContent = errors;
    errorList.appendChild(li);
  }

  errorBanner.classList.remove("hidden");
  errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ==============================================================================
// Loading State Helpers
// ==============================================================================
function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    btnText.textContent = "Generating...";
    btnSpinner.classList.remove("hidden");
    loadingState.classList.remove("hidden");
    emptyState.classList.add("hidden");
    if (exportMarkdownBtn) {
      exportMarkdownBtn.classList.add("hidden");
    }
    if (paginationControls) {
      paginationControls.classList.add("hidden");
    }
    ideasList.innerHTML = "";
    clearAllErrors();
    updateStatus("Generating ideas...");
  } else {
    submitBtn.disabled = false;
    btnText.textContent = "(Generate 10 ideas)";
    btnSpinner.classList.add("hidden");
    loadingState.classList.add("hidden");
  }
}

function updateStatus(message) {
  if (resultsStatus) {
    resultsStatus.textContent = message;
  }
}

// ==============================================================================
// Form Submission & Validation
// ==============================================================================
async function handleFormSubmit(event) {
  event.preventDefault();
  clearAllErrors();

  const hoursRemaining = parseFloat(document.getElementById("hoursRemaining").value);
  const teamSize = parseInt(document.getElementById("teamSize").value, 10);
  const skillLevel = document.querySelector('input[name="skill_level"]:checked')?.value;
  const tone = document.querySelector('input[name="tone"]:checked')?.value;
  const demoStyle = document.querySelector('input[name="demo_style"]:checked')?.value;
  const riskAppetite = document.querySelector('input[name="risk_appetite"]:checked')?.value;
  const themeInput = document.getElementById("theme").value.trim();
  const stackInput = document.getElementById("preferredStack").value.trim();

  // Client-side checks for obvious validation errors
  const clientErrors = {};
  const summaryErrors = [];

  if (isNaN(hoursRemaining) || hoursRemaining <= 0 || hoursRemaining > 1000) {
    clientErrors.hours_remaining = "Hours must be greater than 0 and at most 1000.";
    summaryErrors.push("Hours Remaining: Must be between 0.1 and 1000 hours.");
  }

  if (isNaN(teamSize) || teamSize < 1 || teamSize > 6) {
    clientErrors.team_size = "Team size must be between 1 and 6.";
    summaryErrors.push("Team Size: Must be between 1 and 6 members.");
  }

  if (!skillLevel) {
    clientErrors.skill_level = "Please select a skill level.";
    summaryErrors.push("Skill Level: Required selection.");
  }

  if (!tone) {
    clientErrors.tone = "Please select an idea tone.";
    summaryErrors.push("Idea Tone: Required selection.");
  }

  if (!demoStyle) {
    clientErrors.demo_style = "Please select a demo style.";
    summaryErrors.push("Demo Style: Required selection.");
  }

  if (!riskAppetite) {
    clientErrors.risk_appetite = "Please select a risk appetite.";
    summaryErrors.push("Risk Appetite: Required selection.");
  }

  if (summaryErrors.length > 0) {
    showFieldErrors(clientErrors);
    showSummaryErrors("Please correct the form fields:", summaryErrors);
    updateStatus("Form validation failed. Please check the highlighted fields.");
    return;
  }

  // Payload matching HackathonInput schema
  const payload = {
    hours_remaining: hoursRemaining,
    team_size: teamSize,
    skill_level: skillLevel,
    tone: tone,
    demo_style: demoStyle,
    risk_appetite: riskAppetite,
    theme: themeInput.length > 0 ? themeInput : null,
    preferred_stack: stackInput.length > 0
      ? stackInput.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : null,
  };

  setLoading(true);

  try {
    const response = await fetch("/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 422 && data.detail) {
        // FastAPI 422 validation errors placed next to fields
        const fieldMap = {};
        const messages = [];

        if (Array.isArray(data.detail)) {
          data.detail.forEach((err) => {
            const fieldName = err.loc ? err.loc[err.loc.length - 1] : "general";
            fieldMap[fieldName] = err.msg;
            messages.push(`${fieldName}: ${err.msg}`);
          });
        } else {
          messages.push(JSON.stringify(data.detail));
        }

        showFieldErrors(fieldMap);
        showSummaryErrors("Server Validation Error (422):", messages);
        updateStatus("Server rejected parameters (422). See field errors.");
      } else {
        const errorMsg = data.detail || `Server returned error status ${response.status}`;
        showSummaryErrors("Idea Generation Failed:", [errorMsg]);
        updateStatus(`Failed: ${errorMsg}`);
      }
      emptyState.classList.remove("hidden");
      return;
    }

    // Success
    currentIdeas = data.ideas || [];
    rubricWeights = data.rubric_weights || {};

    // Dynamically update How Scores Work weights table if API returned weights
    updateRubricTable(rubricWeights);

    // Save to localStorage recent ideas
    const topIdea = currentIdeas.length > 0 ? currentIdeas[0] : null;
    if (topIdea) {
      HackpixelHelpers.saveRecentIdea({
        date: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        formInput: payload,
        topIdeaTitle: topIdea.title,
        topIdeaScore: topIdea.total_score,
      });
      renderRecentIdeas();
      updateStatusStrip();
    }

    resultsControls.classList.remove("hidden");
    emptyState.classList.add("hidden");
    if (exportMarkdownBtn) {
      exportMarkdownBtn.classList.remove("hidden");
    }

    applySortAndFilter(true);
    triggerPixelBloom();
  } catch (err) {
    showSummaryErrors("Network Error:", [
      `Could not communicate with the backend: ${err.message}. Ensure the FastAPI server is running.`,
    ]);
    emptyState.classList.remove("hidden");
    if (paginationControls) paginationControls.classList.add("hidden");
    updateStatus("Network connection error. Server unreachable.");
  } finally {
    setLoading(false);
  }
}

// ==============================================================================
// Sorting, Filtering & Pagination
// ==============================================================================
function applySortAndFilter(resetPage = true) {
  if (!currentIdeas || currentIdeas.length === 0) {
    ideasList.innerHTML = "";
    if (paginationControls) paginationControls.classList.add("hidden");
    return;
  }

  const sortValue = sortSelect.value;
  const stackQuery = filterStack.value;

  // 1. Filter by stack using pure helper
  let filtered = HackpixelHelpers.filterIdeasByStack(currentIdeas, stackQuery);

  // 2. Sort by total score or estimated hours using pure helper
  filtered = HackpixelHelpers.sortIdeas(filtered, sortValue);

  currentFilteredIdeas = filtered;

  if (resetPage) {
    currentPage = 1;
  }

  renderPaginatedIdeas(false);
}

function renderPaginatedIdeas(shouldScroll = false) {
  if (!currentFilteredIdeas || currentFilteredIdeas.length === 0) {
    ideasList.innerHTML = "";
    if (paginationControls) paginationControls.classList.add("hidden");
    const noResults = document.createElement("div");
    noResults.className = "empty-state-panel card";
    noResults.innerHTML = `
      <p class="empty-state-line">No ideas matched your stack filter. Try clearing or broadening your search.</p>
    `;
    ideasList.appendChild(noResults);
    updateStatus("No ideas matched your stack filter criteria.");
    return;
  }

  const sortValue = sortSelect.value;
  const sortLabel = sortValue === "hours_asc" ? "estimated hours" : "total score";
  const stackQuery = filterStack.value.trim();

  // Paginate current filtered list
  const pagination = HackpixelHelpers.paginate(currentFilteredIdeas, currentPage, pageSize);
  currentPage = pagination.currentPage;
  const { pageItems, totalPages, totalItems, startIndex, endIndex } = pagination;

  // Screen reader status announcement
  const rangeStr = `${startIndex + 1}–${endIndex}`;
  if (stackQuery) {
    updateStatus(`Showing page ${currentPage} of ${totalPages} (${rangeStr} of ${totalItems} ideas filtered by "${stackQuery}"). Sorted by ${sortLabel}.`);
  } else {
    updateStatus(`Showing page ${currentPage} of ${totalPages} (${rangeStr} of ${totalItems} ideas). Sorted by ${sortLabel}.`);
  }

  // Render cards for the active page
  renderCards(pageItems, startIndex);

  // Render Pagination Controls Bar
  if (paginationControls) {
    paginationControls.classList.remove("hidden");

    if (pageInfoText) {
      pageInfoText.textContent = `Page ${currentPage} of ${totalPages} (Showing ${rangeStr} of ${totalItems})`;
    }

    if (firstPageBtn) {
      firstPageBtn.disabled = currentPage <= 1;
    }
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage <= 1;
    }
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage >= totalPages;
    }
    if (lastPageBtn) {
      lastPageBtn.disabled = currentPage >= totalPages;
    }

    if (pageNumbersContainer) {
      pageNumbersContainer.innerHTML = "";
      for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `page-btn page-num-btn ${p === currentPage ? "active" : ""}`;
        btn.textContent = p.toString();
        btn.setAttribute("aria-label", `Page ${p}`);
        if (p === currentPage) {
          btn.setAttribute("aria-current", "page");
        }
        btn.addEventListener("click", () => goToPage(p));
        pageNumbersContainer.appendChild(btn);
      }
    }
  }

  if (shouldScroll) {
    const resultsHeader = document.getElementById("results-heading");
    if (resultsHeader) {
      resultsHeader.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function goToPage(targetPage) {
  const pagination = HackpixelHelpers.paginate(currentFilteredIdeas, targetPage, pageSize);
  if (pagination.currentPage !== currentPage) {
    currentPage = pagination.currentPage;
    renderPaginatedIdeas(true);
  }
}

function handlePageSizeChange(event) {
  const newSize = parseInt(event.target.value, 10);
  if (!isNaN(newSize) && newSize > 0) {
    pageSize = newSize;
    currentPage = 1;
    renderPaginatedIdeas(true);
  }
}

// ==============================================================================
// Architecture Presets (Modern Jamstack, AI-Native, Mobile, Data, Edge)
// ==============================================================================
const ARCHITECTURE_PRESETS = {
  jamstack: {
    hours: 24,
    team: 3,
    skill: "intermediate",
    tone: "serious",
    demo: "live_app",
    risk: "balanced",
    stack: "Next.js 15, Tailwind CSS, Supabase, TypeScript, Vercel",
    theme: "Modern Jamstack & Scalable Web",
  },
  "ai-native": {
    hours: 36,
    team: 3,
    skill: "advanced",
    tone: "experimental",
    demo: "live_app",
    risk: "ambitious",
    stack: "FastAPI, Google Gemini, Python, React, ChromaDB",
    theme: "AI Developer Tooling & Automation",
  },
  mobile: {
    hours: 24,
    team: 2,
    skill: "intermediate",
    tone: "fun",
    demo: "live_app",
    risk: "balanced",
    stack: "Flutter, Dart, Firebase, Cloud Functions",
    theme: "Mobile-First Offline Experience",
  },
  data: {
    hours: 12,
    team: 2,
    skill: "intermediate",
    tone: "serious",
    demo: "data_story",
    risk: "safe",
    stack: "Python, Streamlit, DuckDB, Pandas, Plotly",
    theme: "Open Data & Public Insights",
  },
  edge: {
    hours: 48,
    team: 4,
    skill: "advanced",
    tone: "serious",
    demo: "live_app",
    risk: "ambitious",
    stack: "Go, Docker, PostgreSQL, Redis, Cloudflare Workers",
    theme: "High-Throughput Edge Infrastructure",
  },
};

function handleApplyPreset(presetKey) {
  const config = ARCHITECTURE_PRESETS[presetKey];
  if (!config) return;
  clearAllErrors();

  document.getElementById("hoursRemaining").value = config.hours;
  document.getElementById("teamSize").value = config.team;
  document.getElementById("preferredStack").value = config.stack;
  document.getElementById("theme").value = config.theme;

  const skillInput = document.querySelector(`input[name="skill_level"][value="${config.skill}"]`);
  if (skillInput) skillInput.checked = true;

  const toneInput = document.querySelector(`input[name="tone"][value="${config.tone}"]`);
  if (toneInput) toneInput.checked = true;

  const demoInput = document.querySelector(`input[name="demo_style"][value="${config.demo}"]`);
  if (demoInput) demoInput.checked = true;

  const riskInput = document.querySelector(`input[name="risk_appetite"][value="${config.risk}"]`);
  if (riskInput) riskInput.checked = true;

  // Visual active feedback on clicked chip
  document.querySelectorAll(".btn-preset").forEach((btn) => {
    btn.classList.toggle("preset-active", btn.dataset.preset === presetKey);
  });

  const presetName = presetKey.toUpperCase();
  updateStatus(`Preset [${presetName}] applied! Parameters loaded.`);
  showCopyToast(`Applied ${presetName} Architecture Preset! ⚡`);
}

// ==============================================================================
// Generative Pixel Bloom Particle Flourish (Inspired by Image 3)
// ==============================================================================
function triggerPixelBloom() {
  if (typeof window === "undefined") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("pixelBloomCanvas");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const colors = ["#89cff0", "#aee2fb", "#ffffff", "#fcd34d", "#f87171", "#7dd3fc"];
  const particles = [];
  const originX = rect.width / 2;
  const originY = 32;

  for (let i = 0; i < 55; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 3.6;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.0,
      size: 3 + Math.floor(Math.random() * 5),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: 0.016 + Math.random() * 0.02,
    });
  }

  let animationFrameId;
  function animate() {
    ctx.clearRect(0, 0, rect.width, rect.height);
    let active = false;

    particles.forEach((p) => {
      if (p.alpha > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
    });

    if (active) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
      cancelAnimationFrame(animationFrameId);
    }
  }

  animate();
}

// ==============================================================================
// Markdown Export & Copy Helpers
// ==============================================================================
function formatIdeaAsMarkdown(idea, rank) {
  const scores = idea.scores || {};
  const scoreBreakdown = Object.entries(scores)
    .map(([crit, s]) => `${crit}: ${s}/5`)
    .join(" | ");
  const stack = Array.isArray(idea.stack) ? idea.stack.join(", ") : "Not specified";
  const risks = Array.isArray(idea.risks) && idea.risks.length > 0 
    ? idea.risks.map((r) => `  - ${r}`).join("\n") 
    : "  - None flagged";
  const dataSources = Array.isArray(idea.data_sources) && idea.data_sources.length > 0 
    ? idea.data_sources.map((d) => `  - ${d}`).join("\n") 
    : "  - Standard free APIs / Open datasets";

  return `### #${rank} ${idea.title} [Score: ${idea.total_score ? idea.total_score.toFixed(2) : "N/A"}/5.0]
> **Pitch**: ${idea.one_line_pitch}

- **Estimated Effort**: ${idea.estimated_hours}h (heuristic estimate)
- **Minimum Viable Version (MVP)**: ${idea.minimum_version}
- **Suggested Stack**: ${stack}
- **Rubric Breakdown**: ${scoreBreakdown}
- **Risks**:
${risks}
- **Data Sources**:
${dataSources}
`;
}

function handleCopyIdea(idea, rank) {
  const md = formatIdeaAsMarkdown(idea, rank);
  copyToClipboard(md, `Idea #${rank} copied to clipboard as Markdown!`);
}

function handleExportAllMarkdown() {
  if (!currentIdeas || currentIdeas.length === 0) return;
  const header = `# Hackpixel Ideation Export
Generated: ${new Date().toLocaleString()}
Parameters: Hours=${document.getElementById("hoursRemaining")?.value || 24}h, Team=${document.getElementById("teamSize")?.value || 3}, Theme="${document.getElementById("theme")?.value || "Open"}"

---

`;
  const body = currentIdeas.map((idea, idx) => formatIdeaAsMarkdown(idea, idx + 1)).join("\n---\n\n");
  const fullText = header + body;

  copyToClipboard(fullText, "All 10 ideas copied to clipboard as Markdown! ✓");

  try {
    const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hackpixel-ideas-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn("Blob download skipped:", err);
  }
}

let toastTimeout;
function showCopyToast(message) {
  if (!copyToast) return;
  copyToast.innerHTML = `<span class="toast-check">&#10003;</span> ${escapeHtml(message)}`;
  copyToast.classList.remove("hidden");
  copyToast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    copyToast.classList.remove("visible");
    copyToast.classList.add("hidden");
  }, 2400);
}

function copyToClipboard(text, successMessage = "Copied to clipboard! ✓") {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showCopyToast(successMessage);
  } catch {
    showCopyToast("Press Ctrl+C to copy");
  }
  document.body.removeChild(textarea);
}

// ==============================================================================
// Card Rendering (Modern Jamstack & Tech UX)
// ==============================================================================
function renderCards(ideas, startIndex = 0) {
  ideasList.innerHTML = "";

  if (ideas.length === 0) {
    return;
  }

  ideas.forEach((idea, index) => {
    const rank = startIndex + index + 1;
    const card = document.createElement("article");
    card.className = "idea-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Idea ${rank}: ${idea.title}`);
    card.style.animationDelay = `${index * 50}ms`;

    // Duplicate Warning Badge
    let duplicateBadgeHtml = "";
    const warning = idea.duplicate_warning || "check skipped";
    if (warning.startsWith("possible match:")) {
      const urlMatch = warning.replace("possible match:", "").trim();
      duplicateBadgeHtml = `
        <span class="badge badge-warning" title="Advisory warning for review, not proof of duplication">
          &#9888; Possible match: <a href="${urlMatch}" target="_blank" rel="noopener noreferrer">${escapeHtml(urlMatch)}</a>
        </span>`;
    } else if (warning === "none found") {
      duplicateBadgeHtml = `<span class="badge badge-success">&#10003; No GitHub duplicates found</span>`;
    } else {
      duplicateBadgeHtml = `<span class="badge badge-skipped">&#8212; Duplicate check skipped</span>`;
    }

    // Suggested Stack tags
    const stackTagsHtml = (idea.stack || [])
      .map((t) => `<span class="stack-tag">${escapeHtml(t)}</span>`)
      .join("");

    // Optional stretch goals
    const extrasHtml = (idea.optional_extras && idea.optional_extras.length > 0)
      ? `<div class="card-section">
           <div class="card-section-title">
             <svg class="tech-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
             <span>Stretch Goals (Optional)</span>
           </div>
           <ul class="card-list">
             ${idea.optional_extras.map((ex) => `<li>${escapeHtml(ex)}</li>`).join("")}
           </ul>
         </div>`
      : "";

    // Identified Risks
    const risksHtml = (idea.risks && idea.risks.length > 0)
      ? `<div class="card-section">
           <div class="card-section-title">
             <svg class="tech-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
             <span>Identified Risks</span>
           </div>
           <ul class="card-list">
             ${idea.risks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join("")}
           </ul>
         </div>`
      : "";

    // Data Sources
    const dataSourcesHtml = (idea.data_sources && idea.data_sources.length > 0)
      ? `<div class="card-section">
           <div class="card-section-title">
             <svg class="tech-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
             <span>Data Sources</span>
           </div>
           <ul class="card-list">
             ${idea.data_sources.map((src) => {
               if (src.startsWith("http://") || src.startsWith("https://")) {
                 return `<li><a href="${src}" target="_blank" rel="noopener noreferrer">${escapeHtml(src)}</a></li>`;
               }
               return `<li>${escapeHtml(src)}</li>`;
             }).join("")}
           </ul>
         </div>`
      : "";

    // Rubric Breakdown with 5-Segment Glowing LED Meters
    const scores = idea.scores || {};
    const explanations = idea.score_explanations || {};
    let rubricGridHtml = "";

    for (const [crit, score] of Object.entries(scores)) {
      const reason = explanations[crit] || "No explanation provided.";
      const critLabel = crit.replace("_", " ");
      const roundedScore = Math.round(score);
      let meterBlocks = "";
      for (let b = 1; b <= 5; b++) {
        meterBlocks += `<span class="meter-block ${b <= roundedScore ? "active" : ""}" aria-hidden="true"></span>`;
      }

      rubricGridHtml += `
        <div class="rubric-item">
          <div class="rubric-item-header">
            <span class="rubric-crit-name">${escapeHtml(critLabel)}</span>
            <div class="rubric-score-wrap">
              <div class="meter-bar-container" title="${score} of 5">${meterBlocks}</div>
              <span class="rubric-crit-score">${score} / 5</span>
            </div>
          </div>
          <div class="rubric-crit-reason">${escapeHtml(reason)}</div>
        </div>
      `;
    }

    const totalScoreDisplay = idea.total_score !== null && idea.total_score !== undefined
      ? `${idea.total_score.toFixed(2)} / 5.0`
      : "Pending";

    const isTopIdea = rank === 1;

    card.innerHTML = `
      <div class="idea-card-header">
        <div class="card-title-group">
          <span class="rank-pill ${isTopIdea ? "rank-pill-top" : ""}">${isTopIdea ? "🏆 #1" : `#${rank}`}</span>
          <h3 class="idea-title">${escapeHtml(idea.title)}</h3>
        </div>
        <div class="header-actions-group">
          <button type="button" class="btn-card-copy" data-rank="${rank}" title="Copy idea formatted as Markdown" aria-label="Copy idea #${rank}">
            <svg class="tech-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          </button>
          <div class="score-badge" aria-label="Total Score: ${totalScoreDisplay} (Estimate)">
            Total Score: ${totalScoreDisplay} <small>(Estimate)</small>
          </div>
        </div>
      </div>

      <p class="one-line-pitch">${escapeHtml(idea.one_line_pitch)}</p>

      <div style="margin-bottom: 0.85rem;">
        ${duplicateBadgeHtml}
      </div>

      <div class="card-section">
        <div class="card-section-title">
          <svg class="tech-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          <span>Minimum Viable Version (MVP)</span>
        </div>
        <p class="card-text">${escapeHtml(idea.minimum_version)}</p>
      </div>

      <div class="card-section">
        <div class="card-section-title">
          <svg class="tech-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Development Effort</span>
        </div>
        <p class="card-text">
          <strong>${idea.estimated_hours} hours (estimate)</strong>
        </p>
      </div>

      <div class="card-section">
        <div class="card-section-title">
          <svg class="tech-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          <span>Suggested Stack</span>
        </div>
        <div class="stack-tags">${stackTagsHtml}</div>
      </div>

      ${extrasHtml}
      ${risksHtml}
      ${dataSourcesHtml}

      <div class="rubric-breakdown">
        <div class="card-section-title">
          <svg class="tech-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <span>Rubric Score Breakdown (Estimates)</span>
        </div>
        <div class="rubric-grid">${rubricGridHtml}</div>
      </div>
    `;

    // Wire Copy Button
    const copyBtn = card.querySelector(".btn-card-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => handleCopyIdea(idea, rank));
    }

    ideasList.appendChild(card);
  });
}

// ==============================================================================
// Recent Ideas Management (localStorage)
// ==============================================================================
function renderRecentIdeas() {
  const recentItems = HackpixelHelpers.getRecentIdeas();
  recentList.innerHTML = "";

  if (recentItems.length === 0) {
    recentEmpty.classList.remove("hidden");
    return;
  }

  recentEmpty.classList.add("hidden");

  recentItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "recent-item";
    li.setAttribute("tabindex", "0");
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", `Refill form with submission from ${item.date}: ${item.topIdeaTitle}`);

    const hours = item.formInput?.hours_remaining ? `${item.formInput.hours_remaining}h` : "";
    const theme = item.formInput?.theme ? `· ${item.formInput.theme}` : "· Open";
    const score = item.topIdeaScore !== null ? `[Score: ${item.topIdeaScore.toFixed(2)}]` : "";

    li.innerHTML = `
      <div class="recent-item-date">${escapeHtml(item.date)}</div>
      <div class="recent-item-title">${escapeHtml(item.topIdeaTitle)} ${escapeHtml(score)}</div>
      <div class="recent-item-meta">${escapeHtml(hours)} ${escapeHtml(theme)}</div>
    `;

    // Click or Enter key refills form
    li.addEventListener("click", () => refillForm(item.formInput));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        refillForm(item.formInput);
      }
    });

    recentList.appendChild(li);
  });
}

function refillForm(inputData) {
  if (!inputData) return;
  clearAllErrors();

  if (inputData.hours_remaining) {
    document.getElementById("hoursRemaining").value = inputData.hours_remaining;
  }
  if (inputData.team_size) {
    document.getElementById("teamSize").value = inputData.team_size;
  }
  if (inputData.theme) {
    document.getElementById("theme").value = inputData.theme;
  } else {
    document.getElementById("theme").value = "";
  }
  if (Array.isArray(inputData.preferred_stack)) {
    document.getElementById("preferredStack").value = inputData.preferred_stack.join(", ");
  } else {
    document.getElementById("preferredStack").value = "";
  }

  // Radio button groups
  if (inputData.skill_level) {
    const el = document.querySelector(`input[name="skill_level"][value="${inputData.skill_level}"]`);
    if (el) el.checked = true;
  }
  if (inputData.tone) {
    const el = document.querySelector(`input[name="tone"][value="${inputData.tone}"]`);
    if (el) el.checked = true;
  }
  if (inputData.demo_style) {
    const el = document.querySelector(`input[name="demo_style"][value="${inputData.demo_style}"]`);
    if (el) el.checked = true;
  }
  if (inputData.risk_appetite) {
    const el = document.querySelector(`input[name="risk_appetite"][value="${inputData.risk_appetite}"]`);
    if (el) el.checked = true;
  }

  updateStatus(`Form refilled from recent history.`);
  // Scroll smoothly to form
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleClearRecent() {
  if (window.confirm("Clear all recent idea history from this browser?")) {
    HackpixelHelpers.clearRecentIdeas();
    renderRecentIdeas();
    updateStatusStrip();
    updateStatus("Recent ideas history cleared.");
  }
}

// ==============================================================================
// How Scores Work Table Updater
// ==============================================================================
function updateRubricTable(weights) {
  if (!weights || Object.keys(weights).length === 0) return;

  for (const [crit, weight] of Object.entries(weights)) {
    const cell = document.querySelector(`.weight-cell[data-crit="${crit}"]`);
    if (cell) {
      const percentage = Math.round(weight * 100);
      cell.textContent = `${percentage}% (${weight.toFixed(2)})`;
    }
  }
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
