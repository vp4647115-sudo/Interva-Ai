"use client";

import { useRef, useState } from "react";
import { GoogleGenAI } from "@google/genai";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const LIVE_MODEL = "gemini-3.1-flash-live-preview";
const COACH_INSTRUCTIONS = `You are InterAI Live Communication Coach. Ask one question at a time and let the user finish. Help improve grammar, vocabulary, clarity, fluency, confidence, sentence structure, filler words, and interview answer quality. Give brief, supportive feedback after important answers: what went well, one important correction, a natural better way to say it, and one retry prompt. Never shame the user, invent facts, or give long lectures. Keep the conversation focused on practical speaking improvement.`;

type LiveSession = {
  sendRealtimeInput(input: { audio: { data: string; mimeType: string } }): void;
  sendRealtimeInput(input: { audioStreamEnd: boolean }): void;
  close(): void;
};

type LiveMessage = {
  serverContent?: {
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    modelTurn?: { parts?: Array<{ inlineData?: { data?: string } }> };
  };
};

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function downsampleToPcm(input: Float32Array, inputRate: number): Uint8Array {
  const outputRate = 16000;
  const ratio = inputRate / outputRate;
  const output = new Uint8Array(Math.floor(input.length / ratio) * 2);
  for (let i = 0; i < output.length / 2; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[Math.floor(i * ratio)]));
    const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    output[i * 2] = value & 0xff;
    output[i * 2 + 1] = (value >> 8) & 0xff;
  }
  return output;
}

function playPcm(audioContext: AudioContext, data: string, nextTime: { value: number }) {
  const binary = atob(data);
  const samples = new Int16Array(binary.length / 2);
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
  }
  const buffer = audioContext.createBuffer(1, samples.length, 24000);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i += 1) channel[i] = samples[i] / 32768;
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  nextTime.value = Math.max(nextTime.value, audioContext.currentTime);
  source.start(nextTime.value);
  nextTime.value += buffer.duration;
}

export function useGeminiLive(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextAudioTime = useRef({ value: 0 });

  async function start(question: string, skill: string, mode: string) {
    try {
      const { getIdToken } = await import("@/lib/firebase/auth");
      const token = await getIdToken();
      const tokenResponse = await fetch(`${API_BASE}/api/communication/live-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const tokenBody = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok) throw new Error(tokenBody.detail ?? "Gemini Live is unavailable.");

      const ai = new GoogleGenAI({ apiKey: tokenBody.token });
      const session = await ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: ["AUDIO"],
          systemInstruction: `${COACH_INSTRUCTIONS}\nTraining skill: ${skill}. Session mode: ${mode}. First question: ${question}`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: LiveMessage) => {
            const content = message.serverContent;
            const inputText = content?.inputTranscription?.text;
            if (inputText) {
              setInterim("");
              onTranscript(inputText);
            }
            if (content?.outputTranscription?.text) setInterim(content.outputTranscription.text);
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data && contextRef.current) playPcm(contextRef.current, part.inlineData.data, nextAudioTime.current);
            }
          },
          onerror: () => setError("Gemini Live connection failed. Check your API quota and try again."),
          onclose: () => setListening(false),
        },
      }) as unknown as LiveSession;
      sessionRef.current = session;
      const audioContext = new AudioContext();
      contextRef.current = audioContext;
      await audioContext.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (event) => {
        if (!sessionRef.current) return;
        const pcm = downsampleToPcm(event.inputBuffer.getChannelData(0), audioContext.sampleRate);
        sessionRef.current.sendRealtimeInput({ audio: { data: toBase64(pcm), mimeType: "audio/pcm;rate=16000" } });
      };
      source.connect(processor);
      processor.connect(audioContext.destination);
      processorRef.current = processor;
      setError(null);
      setListening(true);
      session.sendRealtimeInput({ audioStreamEnd: true });
      session.sendRealtimeInput({ audio: { data: toBase64(new TextEncoder().encode(question)), mimeType: "text/plain" } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start Gemini Live.");
      stop();
    }
  }

  function stop() {
    processorRef.current?.disconnect();
    processorRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    contextRef.current?.close();
    contextRef.current = null;
    sessionRef.current?.close();
    sessionRef.current = null;
    setListening(false);
    setInterim("");
  }

  return { listening, interim, error, start, stop, setError };
}
