const API_URL = 'http://localhost:8000';

const questionEl = document.getElementById('question');
const roleEl = document.getElementById('role');
const answerEl = document.getElementById('answer');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const askButton = document.getElementById('ask');
const shareScreenButton = document.getElementById('share-screen');
const transcriptEl = document.getElementById('transcript');

let isScreenSharing = false;
let streamRef = null;

function updateTranscript(text) {
  transcriptEl.textContent = text || 'Transcript will appear here when your screen is shared.';
}

function stopSharedStream() {
  if (streamRef) {
    streamRef.getTracks().forEach((track) => track.stop());
    streamRef = null;
  }
  isScreenSharing = false;
  shareScreenButton.textContent = 'Share my screen';
  updateTranscript('Transcript will appear here when your screen is shared.');
  statusEl.textContent = 'Screen share stopped.';
}

async function shareScreen() {
  if (!chrome.desktopCapture) {
    errorEl.textContent = 'This browser does not support desktop capture for the Buddy extension.';
    return;
  }

  if (isScreenSharing) {
    stopSharedStream();
    return;
  }

  chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], (streamId) => {
    if (!streamId) {
      statusEl.textContent = 'Screen choice cancelled.';
      return;
    }

    chrome.tabCapture.capture({
      targetTabId: undefined,
      video: true,
      audio: true,
    }, (stream) => {
      if (!stream) {
        errorEl.textContent = 'The browser blocked the screen-share request.';
        return;
      }

      streamRef = stream;
      isScreenSharing = true;
      shareScreenButton.textContent = 'Stop sharing';
      statusEl.textContent = 'Screen share active.';
      updateTranscript('Listening to your screen share and transcript...');

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', stopSharedStream);
      }

      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionCtor) {
        updateTranscript('Screen share is live. Speech transcription needs Chrome or Edge.');
        return;
      }

      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          transcript += result[0].transcript + (result.isFinal ? '\n' : ' ');
        }
        updateTranscript(transcript.trim() || 'Listening to your answer…');
      };
      recognition.onerror = () => {
        updateTranscript('Speech transcription is paused. Try again after approving mic access.');
      };
      recognition.start();
    });
  });
}

async function getActivePageContext() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return { url: '', title: '', text: '' };

    const response = await chrome.tabs.sendMessage(tab.id, { type: 'getPageMetadata' });
    return {
      url: response?.url || tab.url || '',
      title: response?.title || tab.title || '',
      text: response?.text || '',
    };
  } catch {
    return { url: '', title: '', text: '' };
  }
}

async function askBuddy() {
  const question = (questionEl.value || '').trim();
  if (!question) {
    errorEl.textContent = 'Please enter a question before asking.';
    return;
  }

  askButton.disabled = true;
  statusEl.textContent = 'Thinking…';
  errorEl.textContent = '';
  answerEl.hidden = true;

  try {
    const context = await getActivePageContext();
    const response = await fetch(`${API_URL}/api/ai/interview-buddy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        targetRole: roleEl.value.trim() || 'general',
        history: [
          {
            role: 'system',
            content: context.title ? `Page: ${context.title}\nURL: ${context.url}\nVisible page context: ${context.text}` : `Page context: ${context.text}`,
          },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || 'The Buddy request failed.');
    }

    const answerText = data.answer || 'I could not generate a reply.';
    const tipsText = data.tips && data.tips.length ? `\n\nCoach tips:\n${data.tips.map((tip) => `• ${tip}`).join('\n')}` : '';

    answerEl.textContent = `${answerText}${tipsText}`;
    answerEl.hidden = false;
    statusEl.textContent = 'Reply ready.';
  } catch (error) {
    statusEl.textContent = 'Request failed.';
    errorEl.textContent = error instanceof Error ? error.message : 'Something went wrong.';
  } finally {
    askButton.disabled = false;
  }
}

askButton.addEventListener('click', askBuddy);
shareScreenButton.addEventListener('click', shareScreen);
