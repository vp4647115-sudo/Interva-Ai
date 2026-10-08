# Interview Buddy Live Skill

## Objective

Create a real-time AI interview helper that behaves like a Gemini Live assistant and works in two modes:
- website mode
- browser extension mode

The helper reads the current interview question, visible page content, and prior answers, then generates a direct answer or coaching response.

## Product behavior

- Small floating assistant bubble
- Optional screen sharing or active-tab capture
- Real-time natural-language Q&A
- Interview memory for the session
- Helpful answers for missed or unclear questions

## Core decision

Use one central Gemini-backed workflow and expose it through two interfaces:
1. website UI
2. extension UI

Avoid creating two separate AI systems.

## Automation workflow

1. Start live session
2. Capture user prompt
3. Capture current screen or interview page context
4. Load recent question + answer memory
5. Build a combined prompt for Gemini Live
6. Call Gemini with interview-specific instructions
7. Return answer + follow-ups + memory update
8. Render result in the floating widget
9. Keep the session state alive for the interview

## Prompt structure

```text
Role: Live interview coach and answer helper
Goal: Answer the current question clearly and practically
Context: current page, visible interview question, recent answers, user request
Style: concise, confident, direct, supportive
Constraints: truthful, no invented facts, keep answer interview-ready
```

## Critical rules

- Always answer based on the visible question and current screen context
- Do not invent facts or company details
- Do not expose unrelated browsing history
- Ask permission before screen capture
- Save only relevant interview context
- Keep answers fast enough for live interview use

## Output form

```json
{
  "answer": "",
  "follow_up": [""],
  "confidence": 0.0,
  "source_context": "",
  "session_memory_update": ""
}
```

## Build order

1. Live backend API route
2. Gemini Live orchestration service
3. Website floating assistant UI
4. Extension popup + screen capture support
5. Session memory
6. UX polish and speed optimization

## Success definition

The feature works when a user can turn on the assistant, ask for an answer, share the screen, and receive a useful live response without leaving the interview flow.
