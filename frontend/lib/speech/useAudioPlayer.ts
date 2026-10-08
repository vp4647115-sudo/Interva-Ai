"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported || !synthRef.current) return;

      stop(); // Stop any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      // Select natural English voice if available
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google")),
      ) ?? voices.find((v) => v.lang.startsWith("en"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        onEnd?.();
      };
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [isSupported, stop],
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isPlaying,
    speak,
    stop,
  };
}
