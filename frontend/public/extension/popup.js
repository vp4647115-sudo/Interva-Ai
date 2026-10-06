const byId = (id) => document.getElementById(id);
const statusEl = byId("status");
const errorEl = byId("error");
const apiUrlEl = byId("api-url");
const emailEl = byId("email");
const passwordEl = byId("password");
const targetRoleEl = byId("target-role");
const questionEl = byId("question");
const answerEl = byId("answer");
const contextPreviewEl = byId("context-preview");
const modelAnswerEl = byId("model-answer");
const analysisEl = byId("analysis");
const voiceButton = byId("voice");

let activePageContext = null;
let recognition = null;
let voiceStartedAt = null;
let voiceDurationSeconds = 0;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function setError(error) {
  errorEl.textContent = error ? error.message || String(error) : "";
}

function formatList(items) {
  return Array.isArray(items) && items.length ? items.map((item) => `• ${item}`).join("\n") : "• No details returned.";
}

async function readActivePage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab is available.");
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      title: document.title,
      url: location.href,
      text: (document.body?.innerText || "").slice(0, 3500),
    }),
  });
  if (!injection?.result) throw new Error("Could not read text from this tab. Try a regular webpage.");
  activePageContext = injection.result;
  contextPreviewEl.textContent = `${activePageContext.title}\n${activePageContext.url}\n${activePageContext.text.slice(0, 500)}`;
  return activePageContext;
}

function setBusy(button, busy, busyText) {
  if (busy) {
    button.dataset.label = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.label || button.textContent;
    button.disabled = false;
  }
}

async function restoreSettings() {
  const stored = await chrome.storage.local.get(["buddyApiBase", "buddyEmail", "buddyTargetRole"]);
  const configuredApiBase = stored.buddyApiBase || window.BUDDY_CONFIG?.apiBase || "";
  if (configuredApiBase) apiUrlEl.value = configuredApiBase;
  if (stored.buddyTargetRole) targetRoleEl.value = stored.buddyTargetRole;
  if (stored.buddyEmail) {
    byId("signed-in").hidden = false;
    byId("signed-out").hidden = true;
    byId("account-email").textContent = stored.buddyEmail;
  }
  setStatus(stored.buddyApiBase && stored.buddyEmail ? "Ready to coach." : "Save the API permission and sign in to start.");
}

byId("save-api").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  setError(null);
  setBusy(button, true, "Saving…");
  try {
    const apiBase = await window.BuddyApi.saveApiBase(apiUrlEl.value);
    apiUrlEl.value = apiBase;
    setStatus("API origin saved and permission granted.");
  } catch (error) {
    setError(error);
    setStatus("Could not save the API origin.", true);
  } finally {
    setBusy(button, false);
  }
});

byId("check-api").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  setError(null);
  setBusy(button, true, "Checking…");
  try {
    await window.BuddyApi.healthCheck();
    setStatus("API is reachable.");
  } catch (error) {
    setError(error);
    setStatus("API connection failed.", true);
  } finally {
    setBusy(button, false);
  }
});

byId("sign-in").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  setError(null);
  setBusy(button, true, "Signing in…");
  try {
    const email = await window.BuddyAuth.signIn(emailEl.value.trim(), passwordEl.value);
    passwordEl.value = "";
    byId("signed-in").hidden = false;
    byId("signed-out").hidden = true;
    byId("account-email").textContent = email;
    setStatus("Signed in. Ready to coach.");
  } catch (error) {
    setError(error);
    setStatus("Sign-in failed.", true);
  } finally {
    setBusy(button, false);
  }
});

byId("sign-out").addEventListener("click", async () => {
  await window.BuddyAuth.signOut();
  byId("signed-in").hidden = true;
  byId("signed-out").hidden = false;
  setStatus("Signed out.");
});

byId("read-page").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  setError(null);
  setBusy(button, true, "Reading…");
  try {
    const page = await readActivePage();
    setStatus(`Read ${page.text.length} characters from this tab. It stays local until you request coaching.`);
  } catch (error) {
    setError(error);
    setStatus("Could not read this tab.", true);
  } finally {
    setBusy(button, false);
  }
});

byId("ask").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const question = questionEl.value.trim();
  if (!question) {
    setError(new Error("Enter an interview question first."));
    return;
  }
  setError(null);
  setBusy(button, true, "Coaching…");
  modelAnswerEl.hidden = true;
  try {
    const pageContext = byId("include-page").checked ? await readActivePage() : null;
    const result = await window.BuddyApi.askBuddy({
      question,
      targetRole: targetRoleEl.value.trim(),
      pageContext,
    });
    modelAnswerEl.textContent = `${result.answer || "No answer returned."}\n\nCoach tips\n${formatList(result.tips)}`;
    modelAnswerEl.hidden = false;
    setStatus("Model answer ready.");
  } catch (error) {
    setError(error);
    setStatus("Could not generate an answer.", true);
  } finally {
    setBusy(button, false);
  }
});

byId("generate-question").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  setError(null);
  setBusy(button, true, "Generating…");
  try {
    const result = await window.BuddyApi.generateQuestion({ targetRole: targetRoleEl.value.trim() });
    questionEl.value = result.question || "";
    answerEl.value = "";
    voiceDurationSeconds = 0;
    analysisEl.hidden = true;
    byId("practice-follow-up").hidden = true;
    setStatus(result.question ? `Question ready${result.topic ? `: ${result.topic}` : ""}.` : "No question was returned.", !result.question);
  } catch (error) {
    setError(error);
    setStatus("Could not generate a question.", true);
  } finally {
    setBusy(button, false);
  }
});

byId("voice").addEventListener("click", () => {
  if (recognition) {
    recognition.stop();
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setError(new Error("Speech dictation is not supported in this browser. Type your answer instead."));
    return;
  }
  recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onstart = () => { voiceStartedAt = Date.now(); };
  recognition.onresult = (event) => {
    let finalText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result.isFinal) finalText += result[0].transcript;
    }
    if (finalText.trim()) answerEl.value = `${answerEl.value.trim()} ${finalText.trim()}`.trim();
  };
  recognition.onerror = (event) => {
    setError(new Error(event.error === "not-allowed" ? "Microphone permission was denied." : `Speech recognition failed: ${event.error}`));
    setStatus("Dictation stopped.", true);
  };
  recognition.onend = () => {
    if (voiceStartedAt !== null) voiceDurationSeconds += Math.round((Date.now() - voiceStartedAt) / 1000);
    voiceStartedAt = null;
    recognition = null;
    voiceButton.textContent = "Start dictation";
    voiceButton.classList.add("secondary");
    setStatus("Dictation stopped.");
  };
  recognition.start();
  voiceButton.textContent = "Stop dictation";
  voiceButton.classList.remove("secondary");
  setError(null);
  setStatus("Listening. Speak your answer, then stop dictation.");
});

byId("coach-answer").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const question = questionEl.value.trim();
  const answer = answerEl.value.trim();
  if (!question || !answer) {
    setError(new Error("Enter the interview question and your answer first."));
    return;
  }
  setError(null);
  setBusy(button, true, "Analyzing…");
  analysisEl.hidden = true;
  byId("practice-follow-up").hidden = true;
  try {
    const result = await window.BuddyApi.analyzeAnswer({
      question,
      answer,
      targetRole: targetRoleEl.value.trim(),
      durationSeconds: voiceDurationSeconds,
    });
    analysisEl.textContent = [
      `Score: ${result.overallScore}/100`,
      `\nQuestion coverage\n${result.questionAnswered === null ? "No interview question was supplied." : result.questionAnswered ? "Your answer addressed the question." : "Your answer did not fully address the question."}`,
      result.questionAssessment ? `\nEvidence\n${result.questionAssessment}` : "",
      `\nCoach\n${result.coachMessage}`,
      `\nStrengths\n${formatList(result.strengths)}`,
      `\nImprovements\n${formatList(result.weaknesses)}`,
      `\nEvidence\n${formatList((result.evidence || []).map((item) => `${item.observation} — ${item.recommendation}`))}`,
      `\nTry this version\n${result.betterVersion || "No rewrite returned."}`,
      `\nRetry prompt\n${result.retryPrompt || "Try answering the question again."}`,
      result.nextQuestion ? `\nFollow-up question\n${result.nextQuestion}` : "",
    ].join("\n");
    analysisEl.hidden = false;
    analysisEl.dataset.nextQuestion = result.nextQuestion || "";
    byId("practice-follow-up").hidden = !result.nextQuestion;
    answerEl.value = result.betterVersion || answer;
    setStatus("Answer analyzed. The improved version is ready to edit or retry.");
  } catch (error) {
    setError(error);
    setStatus("Could not analyze the answer.", true);
  } finally {
    setBusy(button, false);
  }
});

byId("practice-follow-up").addEventListener("click", () => {
  questionEl.value = analysisEl.dataset.nextQuestion || "";
  answerEl.value = "";
  voiceDurationSeconds = 0;
  analysisEl.hidden = true;
  byId("practice-follow-up").hidden = true;
  questionEl.focus();
  setStatus("Follow-up question ready.");
});

targetRoleEl.addEventListener("change", () => {
  void chrome.storage.local.set({ buddyTargetRole: targetRoleEl.value.trim() });
});

void restoreSettings().catch((error) => {
  setError(error);
  setStatus("Extension storage is unavailable.", true);
});
