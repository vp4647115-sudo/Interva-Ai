"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import type { FaceAnalysisSummary } from "./useFaceEmotionScanner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const LIVE_MODEL = "gemini-3.1-flash-live-preview";

const COACH_SYSTEM_INSTRUCTION = `You are InterAI Live Communication Coach.

Your role is to help the user improve their spoken communication through
natural, real-time voice conversations.

You are a professional communication trainer, English speaking coach,
interview coach, public speaking coach, and workplace communication mentor.

YOUR GOALS:
1. Help the user speak more confidently.
2. Improve grammar without interrupting excessively.
3. Improve vocabulary and sentence structure.
4. Improve clarity and fluency.
5. Identify repeated communication mistakes.
6. Adapt exercises to the user's skill level.
7. Encourage the user and maintain a natural conversation.

CONVERSATION RULES:
- Speak naturally and conversationally.
- Do not give long lectures.
- Ask one question at a time.
- Let the user finish speaking before giving major feedback.
- If the user makes a small mistake, usually continue naturally.
- Correct important or repeated mistakes after the user finishes.
- Give the corrected sentence and ask the user to repeat it when useful.
- Gradually increase difficulty based on performance.
- Be supportive but honest.

AFTER IMPORTANT USER RESPONSES, EVALUATE:
- Grammar
- Vocabulary
- Clarity
- Fluency
- Confidence
- Sentence structure

FEEDBACK FORMAT:
1. What was done well
2. Important mistake
3. Better way to say it
4. Short practice task

Never shame or discourage the user.

Remember recurring mistakes during the current session and actively create
practice exercises targeting those weaknesses.

VISUAL COACHING:
- Camera images are never sent. You may receive labeled, locally computed facial movement and frame-quality summaries.
- Treat each summary as silent metadata, not as a user utterance. Do not respond to the metadata itself.
- Only describe measured fields that are present and quality-qualified. If a value is null, missing, low-quality, or unavailable, say it is unknown; never fill in a guess.
- Smile, brow, and mouth values are movement proxies only. Never label an emotion or infer intent, honesty, personality, mental health, competence, or hiring suitability.
- Head-facing is only an approximate head-direction proxy, not measured eye contact or gaze. Do not claim eye contact from it.
- Use visual information only for brief, optional presentation coaching after the user finishes speaking. Never interrupt speech or use these signals in interview scoring.`;

// ── Types ─────────────────────────────────────────────────────────────────

type LiveSession = {
  sendRealtimeInput(input: {
    audio?: { data: string; mimeType: string };
    text?: string;
  }): void;
  close(): void;
};

type LiveMessage = {
  setupComplete?: boolean;
  serverContent?: {
    turnComplete?: boolean;
    interrupted?: boolean;
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    modelTurn?: { parts?: Array<{ inlineData?: { data?: string } }> };
  };
};

export interface GeminiLiveTranscript {
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

// ── Audio helpers ─────────────────────────────────────────────────────────

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Downsample browser mic audio (typically 44.1/48 kHz) to 16 kHz 16-bit PCM. */
function downsampleToPcm(input: Float32Array, inputRate: number): Uint8Array {
  const outputRate = 16000;
  const ratio = inputRate / outputRate;
  const length = Math.floor(input.length / ratio);
  const output = new Uint8Array(length * 2);
  for (let i = 0; i < length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[Math.floor(i * ratio)]));
    const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    output[i * 2] = value & 0xff;
    output[i * 2 + 1] = (value >> 8) & 0xff;
  }
  return output;
}

/** Schedule a decoded 24 kHz PCM audio chunk for gapless playback.
 *  Returns the RMS amplitude (0–1) of the chunk for visualization. */
function playPcm(
  audioContext: AudioContext,
  data: string,
  nextTime: { value: number },
  activeSources: Set<AudioBufferSourceNode>,
): number {
  if (audioContext.state === "closed") return 0;
  try {
    const binary = atob(data);
    const samples = new Int16Array(binary.length / 2);
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
    }
    const buffer = audioContext.createBuffer(1, samples.length, 24000);
    const channel = buffer.getChannelData(0);
    let sumSq = 0;
    for (let i = 0; i < samples.length; i += 1) {
      channel[i] = samples[i] / 32768;
      sumSq += channel[i] * channel[i];
    }
    const rms = Math.sqrt(sumSq / samples.length);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    activeSources.add(source);
    source.onended = () => {
      activeSources.delete(source);
    };

    nextTime.value = Math.max(nextTime.value, audioContext.currentTime);
    source.start(nextTime.value);
    nextTime.value += buffer.duration;
    return Math.min(1, rms * 4); // Normalize to 0–1 range
  } catch {
    return 0;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useGeminiLive() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiAudioLevel, setAiAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<GeminiLiveTranscript[]>([]);

  const isConnectingRef = useRef(false);
  const sessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextAudioTime = useRef({ value: 0 });

  // Accumulate partial transcriptions between turn boundaries.
  const pendingUserText = useRef("");
  const pendingAiText = useRef("");

  const setFacialSummary = useCallback((summary: FaceAnalysisSummary | null) => {
    const session = sessionRef.current;
    if (!session || !summary) return;
    try {
      session.sendRealtimeInput({
        text: `[SILENT LOCAL CAMERA SUMMARY; DO NOT RESPOND TO THIS MESSAGE]\n${JSON.stringify({
          schemaVersion: summary.schemaVersion,
          status: summary.status,
          sampleCount: summary.sampleCount,
          usableSampleCount: summary.usableSampleCount,
          facePresenceRatio: summary.facePresenceRatio,
          singleFaceRatio: summary.singleFaceRatio,
          frameQuality: summary.frameQuality,
          brightnessQuality: summary.brightnessQuality,
          sharpnessQuality: summary.sharpnessQuality,
          headFacingCameraRatio: summary.headFacingCameraRatio,
          smileMovementMean: summary.smileMovementMean,
          browMovementMean: summary.browMovementMean,
          mouthMovementMean: summary.mouthMovementMean,
          expressionMovementMean: summary.expressionMovementMean,
          faceMotionStability: summary.faceMotionStability,
          faceTrackingConfidence: summary.faceTrackingConfidence,
          gazeDirection: summary.gazeDirection,
          occlusion: summary.occlusion,
          limitations: summary.limitations,
        })}`,
      });
    } catch {
      // Visual summaries are optional and must not interrupt the voice session.
    }
  }, []);

  /** Flush any accumulated AI text into a message bubble. */
  const flushAiText = useCallback(() => {
    const text = pendingAiText.current.trim();
    if (text) {
      setMessages((prev) => [...prev, { role: "ai", text, timestamp: Date.now() }]);
      pendingAiText.current = "";
    }
  }, []);

  /** Flush any accumulated user text into a message bubble. */
  const flushUserText = useCallback(() => {
    const text = pendingUserText.current.trim();
    if (text) {
      setMessages((prev) => [...prev, { role: "user", text, timestamp: Date.now() }]);
      pendingUserText.current = "";
    }
  }, []);

  /** Stop the live session and clean up ALL resources immediately. */
  const stop = useCallback(() => {
    isConnectingRef.current = false;
    setConnecting(false);
    // Flush any remaining text.
    flushUserText();
    flushAiText();

    // 1. Stop all active playing audio buffer sources immediately.
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore if already stopped
      }
    });
    activeSourcesRef.current.clear();

    // 2. Disconnect mic audio processor.
    if (processorRef.current) {
      try {
        processorRef.current.onaudioprocess = null;
        processorRef.current.disconnect();
      } catch {
        // ignore
      }
      processorRef.current = null;
    }

    // 3. Stop microphone media stream tracks.
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    // 4. Close AudioContext.
    if (contextRef.current && contextRef.current.state !== "closed") {
      try {
        void contextRef.current.close();
      } catch {
        // ignore
      }
      contextRef.current = null;
    }

    // 5. Close Gemini Live WebSocket session.
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch {
        // ignore
      }
      sessionRef.current = null;
    }

    setListening(false);
    setConnected(false);
    setAiSpeaking(false);
    setAiAudioLevel(0);
  }, [flushUserText, flushAiText]);

  // ── Automatic cleanup on tab switch, unmount, reload, or page navigate ──

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop();
      }
    };
    const handlePageHide = () => {
      stop();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      stop(); // Stop immediately when page/component unmounts or user navigates away
    };
  }, [stop]);

  /** Start a live coaching session. */
  const start = useCallback(
    async (question: string, skill: string, mode: string) => {
      if (isConnectingRef.current) return;
      isConnectingRef.current = true;
      setConnecting(true);

      // Ensure any prior session is fully stopped first.
      stop();

      try {
        setError(null);
        setMessages([]);
        pendingUserText.current = "";
        pendingAiText.current = "";

        // 1. Get ephemeral token from backend.
        const { getIdToken } = await import("@/lib/firebase/auth");
        const token = await getIdToken();
        const tokenResponse = await fetch(
          `${API_BASE}/api/communication/live-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ skill, mode }),
          },
        );
        const tokenBody = await tokenResponse.json().catch(() => ({}));
        if (!tokenResponse.ok) {
          throw new Error(
            tokenBody.detail ?? "Gemini Live is unavailable. Check your API key.",
          );
        }

        // 2. Open the Gemini Live WebSocket connection.
        const ai = new GoogleGenAI({
          apiKey: tokenBody.token,
          httpOptions: { apiVersion: "v1alpha" },
        });
        const session = (await ai.live.connect({
          model: LIVE_MODEL,
          config: {
            responseModalities: ["AUDIO" as unknown as import("@google/genai").Modality],
            systemInstruction: `${COACH_SYSTEM_INSTRUCTION}\n\nTraining skill: ${skill}.\nSession mode: ${mode}.\nFirst question to ask the user: "${question}".\nStart by greeting the user warmly and then asking the first question.`,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setConnected(true);
            },
            onmessage: (e: unknown) => {
              const message = e as LiveMessage;
              if (message.setupComplete) return;

              const content = message.serverContent;
              if (!content) return;

              // User transcription.
              if (content.inputTranscription?.text) {
                pendingUserText.current += content.inputTranscription.text;
              }

              // AI transcription.
              if (content.outputTranscription?.text) {
                pendingAiText.current += content.outputTranscription.text;
                setAiSpeaking(true);
              }

              // AI audio chunks — play and measure level.
              for (const part of content.modelTurn?.parts ?? []) {
                if (part.inlineData?.data && contextRef.current) {
                  const level = playPcm(
                    contextRef.current,
                    part.inlineData.data,
                    nextAudioTime.current,
                    activeSourcesRef.current,
                  );
                  setAiAudioLevel(level);
                }
              }

              // Turn complete.
              if (content.turnComplete) {
                flushUserText();
                flushAiText();
                setAiSpeaking(false);
                setAiAudioLevel(0);
              }

              // Interrupted — AI was cut off.
              if (content.interrupted) {
                // Stop any audio chunks currently playing
                activeSourcesRef.current.forEach((src) => {
                  try {
                    src.stop();
                  } catch {
                    // ignore
                  }
                });
                activeSourcesRef.current.clear();
                flushAiText();
                setAiSpeaking(false);
                setAiAudioLevel(0);
              }
            },
            onerror: (e: unknown) => {
              console.error("Gemini Live error:", e);
              setError(
                "Gemini Live connection failed. Check your API quota and try again.",
              );
            },
            onclose: () => {
              flushUserText();
              flushAiText();
              setConnected(false);
              setListening(false);
              setAiSpeaking(false);
              setAiAudioLevel(0);
            },
          },
        })) as unknown as LiveSession;

        sessionRef.current = session;

        // 3. Set up microphone capture.
        const audioContext = new AudioContext();
        contextRef.current = audioContext;
        await audioContext.resume();

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (event) => {
          if (!sessionRef.current) return;
          const pcm = downsampleToPcm(
            event.inputBuffer.getChannelData(0),
            audioContext.sampleRate,
          );
          sessionRef.current.sendRealtimeInput({
            audio: { data: toBase64(pcm), mimeType: "audio/pcm;rate=16000" },
          });
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
        processorRef.current = processor;

        setListening(true);
        session.sendRealtimeInput({
          text: `Begin the coaching session now. Greet the user briefly and ask this opening question: ${question}`,
        });
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Could not start Gemini Live.",
        );
        stop();
      } finally {
        isConnectingRef.current = false;
        setConnecting(false);
      }
    },
    [stop, flushUserText, flushAiText],
  );

  /** Get full transcript for scoring. */
  const getFullTranscript = useCallback((): {
    userText: string;
    aiText: string;
    messages: GeminiLiveTranscript[];
  } => {
    return {
      userText: messages
        .filter((m) => m.role === "user")
        .map((m) => m.text)
        .join(" "),
      aiText: messages
        .filter((m) => m.role === "ai")
        .map((m) => m.text)
        .join(" "),
      messages,
    };
  }, [messages]);

  return {
    connected,
    connecting,
    listening,
    aiSpeaking,
    aiAudioLevel,
    error,
    messages,
    start,
    setFacialSummary,
    stop,
    setError,
    getFullTranscript,
  };
}
