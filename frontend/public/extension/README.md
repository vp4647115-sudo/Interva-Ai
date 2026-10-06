# IntervAI Buddy Extension

## Install in Chrome or Edge

1. Download and extract `interv-ai-buddy-extension.zip`.
2. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
3. Choose **Load unpacked** and select the extracted `extension` folder.
4. Open the Buddy popup, expand **API connection**, verify the HTTPS origin of your FastAPI deployment, and choose **Save API**. Vercel builds prefill this from `NEXT_PUBLIC_API_URL`; the browser still asks permission for that API host. Choose **Test connection** to verify `/health`.
5. Sign in with the email and password for your Interview AI Firebase account. If you normally use Google sign-in, set a password for that account using the Interview AI password reset page first.

## Use

- Generate a role-based practice question or ask Buddy for a model answer. Page text is read only after selecting **Read active page**, and is sent only when **Include active page context with my request** is checked.
- Enter or dictate your answer, then choose **Analyze answer**. The API applies the `interview-communication` skill and returns question coverage, transcript evidence, strengths, improvements, a stronger version, and a follow-up question you can practice immediately.
- The extension does not record or upload screen video. Dictation uses the browser's speech-recognition service.

## Requirements

- The API origin must use HTTPS outside localhost and must expose the FastAPI `/health`, `/api/ai/interview-buddy`, and `/api/communication/analyze` routes.
- The API must have Firebase token verification and Gemini configured. Communication analysis also needs the application's database and migrations available.
- Use a current Chromium-based browser with extension support. Microphone access is required only for dictation.

The extension stores its Firebase refresh token in browser extension local storage. Sign out from the popup on shared devices.
