---
name: interview-buddy-live
description: "Use when building the Interview Buddy live AI assistant with Gemini Live, screen-sharing Q&A, interview memory, website mode, and browser-extension mode. Covers architecture, automation flow, user flows, and implementation sequencing for a live interview copilot."
---

# Interview Buddy Live

## Role

You are the automation and product-planning skill for an Interview Buddy that behaves like a Gemini Live assistant inside both the web app and a browser extension.

The product must help a user during interviews by:
- answering missed or unclear questions
- reviewing the visible screen or current interview page
- using the Gemini Live API for real-time reasoning
- preserving session context and interview history
- working in two modes: website and extension
- staying helpful, fast, and privacy-aware

## Operating principles

Follow the project rules in [CLAUDE.md](../../CLAUDE.md) and the WAT framework:
- separate orchestration from execution
- prefer reusable workflows over ad hoc scripts
- build with a shared core and two UI entry points
- keep the AI engine centralized and the interfaces thin

## Goal

Make the Interview Buddy behave like a small floating AI assistant that the user can activate at any moment while browsing or interviewing.

It should support:
1. AI chat or Q&A mode on the website
2. Screen-share / live context mode in the browser extension
3. Context-aware answer generation based on what is visible on screen
4. Persistent interview memory during the current session
5. Fast response using Gemini Live as the reasoning model

## Product behavior

### Website mode
- User opens the website
- Starts Interview Buddy from the left sidebar or a floating launcher
- Types a question or speaks
- Optional: attach screen context or interview page context
- AI answers based on the active interview questions, page content, and recent memory

### Extension mode
- User installs the browser extension
- The extension icon stays as a floating or compact widget
- User clicks it and starts a session
- User enables screen share or active tab capture
- The extension captures visible screen content
- AI reads visible content and answers questions like "Give me an answer" or "What is the best response to this question?"

### Live assistant flow
- Capture user prompt
- Capture active page or screen context
- Load the current interview context and question history
- Send the combined context to Gemini Live
- Return concise, actionable answer with follow-up suggestions
- Store answer in memory for the session

## Shared architecture

Use one central AI orchestration layer shared by both paths.

### Core modules
- `backend/app/api/interview_buddy.py` or equivalent live assistant API route
- `backend/app/services/interview_buddy_service.py`
- `backend/app/core/gemini_live_client.py`
- `backend/app/core/session_memory.py`
- `backend/app/core/screen_context.py`

### Frontend website modules
- `frontend/components/interview/InterviewBuddyWidget.tsx`
- `frontend/components/interview/InterviewBuddyPanel.tsx`
- `frontend/services/interviewBuddy.ts`

### Browser extension modules
- `frontend/public/extension/manifest.json`
- `frontend/public/extension/background.js`
- `frontend/public/extension/content.js`
- `frontend/public/extension/popup.html`
- `frontend/public/extension/popup.js`

## Automation flow

### 1. Start session
- User clicks the assistant
- Session creates a fresh live context object
- Session stores:
  - current interview topic
  - recent questions asked
  - previous answers
  - user intent
  - screen context snapshot

### 2. Capture context
Collect any of the following available inputs:
- user question text
- spoken question / voice input
- current page DOM text or visible text
- screenshot / screen-share frame
- current interview question from app state
- previous answers already given

### 3. Build Gemini prompt
Construct one structured prompt containing:
- role: live interview coach / answer helper
- current interview question
- recent conversation history
- visible page or screen content
- user goal: answer, explain, improve, summarize, practice
- constraints: be direct, truthful, supportive, and concise

### 4. Invoke Gemini Live
Call the Gemini model with:
- system instructions for interview coaching
- user request
- screen context
- answer history
- target response style

### 5. Return structured result
Response should include:
- `answer`: main response text
- `follow_up`: optional next question or prompt
- `confidence`: quality estimate
- `source_context`: what was used to form the answer
- `session_memory_update`: summary to store

### 6. Save session memory
Persist the interaction in-session so the next answer can leverage prior context.

### 7. Render UI
- website: floating panel or sidebar widget
- extension: popup bubble or mini panel
- user can copy answer, ask another question, or continue the interview

## Required conversation rules

- Keep answers practical and interview-focused
- If the user asks for a direct answer, give the answer first
- If the user asks for brainstorming, provide the structure before the final answer
- If the screen shows a question, answer that question directly
- If the user has missed a question, propose the best answer and explain why
- Keep the response short enough to be useful in a live interview flow
- Do not pretend to know hidden information not visible on screen
- Never fabricate credentials, company facts, or interviewer behavior

## Privacy and trust rules

- Request explicit permission before capturing screen content
- Do not store arbitrary browsing history by default
- Keep capture limited to the active interview page or active tab when possible
- Log only the interview context, not unrelated data
- Avoid using the AI to exfiltrate sensitive user information outside the active session

## Implementation checklist

### Step 1 — backend API
- Create live assistant endpoint to accept user message + screen context + interview context
- Validate session and user identity
- Send to Gemini Live
- Return answer and memory payload

### Step 2 — website widget
- Add a floating assistant panel
- Add question input and voice support
- Add screen-context toggle
- Render live answer stream and memory log

### Step 3 — extension UI
- Add the extension icon and popup
- Add screen-share permission flow
- Add minimal floating bubble for Q&A
- Connect popup to backend API

### Step 4 — context extraction
- Read page text or visible DOM when available
- Capture screenshot or active-tab metadata when available
- Normalize into the prompt payload

### Step 5 — answer quality
- Add final answer formatting rules
- Add short and long response styles
- Support example-driven answer generation when asked for interview prep

## Output contract for the assistant

Use a response structure like this:

```json
{
  "answer": "",
  "follow_up": [""],
  "confidence": 0.0,
  "source_context": "",
  "session_memory_update": ""
}
```

## Success criteria

The feature is successful when:
- a user can activate the assistant on the website
- a user can activate the assistant from the browser extension
- the assistant uses current screen context to answer interview questions
- the session remembers recent answers and questions
- the Gemini Live model produces a direct and useful answer with minimal delay
- the assistant feels like a floating live helper instead of a normal chat box

## Build order

1. Shared backend live-answer API
2. Gemini Live prompt contract
3. Website widget UI
4. Extension popup + permissions
5. Screen context capture
6. Session memory and history
7. Polish, latency tuning, and UX improvements

## Reference pattern

Use the same live AI direction already present in the repo, especially:
- [frontend/lib/speech/useGeminiLive.ts](../../../frontend/lib/speech/useGeminiLive.ts)
- [frontend/public/extension/manifest.json](../../../frontend/public/extension/manifest.json)
- [frontend/public/extension/background.js](../../../frontend/public/extension/background.js)

This skill defines the automation plan for building an Interview Buddy that feels like a Gemini Live interview copilot across both web and extension interfaces.
