"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export interface UseVoiceAnswerOptions {
  onTranscriptChange?: (text: string) => void;
}

export function useVoiceAnswer(options?: UseVoiceAnswerOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 1
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors when stopping already stopped recognition
      }
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsListening(false);
    setInterimTranscript("");
    setVolumeLevel(0);
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    stopListening();
    setError(null);

    try {
      // 1. Setup AudioContext for live microphone level analysis
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (analyser && audioCtx.state !== "closed") {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i += 1) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setVolumeLevel(Math.min(1, average / 128));
          animFrameRef.current = requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();

      // 2. Setup Web Speech Recognition
      const Ctor: SpeechRecognitionCtor =
        (window as unknown as { SpeechRecognition: SpeechRecognitionCtor }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition: SpeechRecognitionCtor }).webkitSpeechRecognition;

      const rec = new Ctor();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let finalChunk = "";
        let interimChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript + " ";
          } else {
            interimChunk += res[0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => {
            const next = (prev + " " + finalChunk).replace(/\s+/g, " ").trim();
            options?.onTranscriptChange?.(next);
            return next;
          });
        }
        setInterimTranscript(interimChunk);
      };

      rec.onerror = (event) => {
        if (event.error === "not-allowed") {
          setError("Microphone permission was denied.");
        } else if (event.error !== "no-speech") {
          setError(`Speech error: ${event.error}`);
        }
        stopListening();
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not access microphone.");
      stopListening();
    }
  }, [isSupported, stopListening, options]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    volumeLevel,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
