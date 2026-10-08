"use client";
// Quick voice-typing test component — drop into page or render standalone
import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";

export default function VoiceTest() {
  const { listening, interim, supported, start, stop, error } = useSpeechRecognition((t) => console.log("FINAL:", t));
  return (
    <div className="p-4 border rounded-card bg-surface space-y-2">
      <p>Supported: <b>{supported ? "YES" : "NO"}</b></p>
      <p>Listening: <b>{listening ? "YES" : "NO"}</b></p>
      <p>Interim: <span className="text-primary">{interim || "—"}</span></p>
      <p>Error: <span className="text-error">{error || "—"}</span></p>
      <button onClick={listening ? stop : start} className="px-3 py-1 bg-primary text-white rounded">{listening ? "Stop" : "Start"}</button>
    </div>
  );
}
