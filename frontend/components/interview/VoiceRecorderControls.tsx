"use client";

import { Mic, MicOff, RotateCcw, Volume2 } from "lucide-react";

interface VoiceRecorderControlsProps {
  isListening: boolean;
  volumeLevel: number;
  interimTranscript: string;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export default function VoiceRecorderControls({
  isListening,
  volumeLevel,
  interimTranscript,
  error,
  onStart,
  onStop,
  onClear,
}: VoiceRecorderControlsProps) {
  // Generate 12 dynamic animated waveform bars based on live volumeLevel
  const bars = Array.from({ length: 12 }).map((_, idx) => {
    const factor = Math.sin((idx / 12) * Math.PI) * 0.8 + 0.2;
    const height = isListening
      ? Math.max(15, Math.min(100, volumeLevel * 100 * factor * (1 + (idx % 3) * 0.2)))
      : 15;
    return height;
  });

  return (
    <div className="rounded-card border border-primary/20 bg-surface-alt/80 p-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Mic Control Button & Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isListening ? onStop : onStart}
            className={`relative inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-xs font-extrabold text-white transition-all shadow-md ${
              isListening
                ? "bg-error animate-pulse hover:bg-error/90"
                : "bg-primary hover:bg-primary/90 shadow-[0_3px_0_#4b31d1]"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> Start Voice Input
              </>
            )}
          </button>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-white px-3 py-2 text-xs font-bold text-ink-secondary hover:bg-surface-alt"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear Audio Text
            </button>
          )}
        </div>

        {/* Animated Audio Waveform Level Meter */}
        <div className="flex items-center gap-1.5 h-8 bg-white/70 px-4 py-1.5 rounded-pill border border-border">
          <Volume2 className={`h-4 w-4 ${isListening ? "text-primary animate-pulse" : "text-ink-secondary/40"}`} />
          <div className="flex items-center gap-1 h-full w-28">
            {bars.map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isListening ? "bg-primary" : "bg-ink-secondary/20"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Interim Transcript or Error Message */}
      {isListening && (
        <div className="mt-3 rounded-card bg-primary-soft/40 p-2.5 text-xs text-primary font-medium flex items-center gap-2 border border-primary/20">
          <span className="h-2 w-2 rounded-full bg-error animate-ping" />
          <span className="italic">{interimTranscript || "Listening to your response..."}</span>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  );
}
