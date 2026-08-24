"use client";

/** Browser speech recognition hook — provides live transcripts for coaching.
 * Uses the Web Speech API (Chrome/Edge); falls back gracefully elsewhere. */

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

export function useSpeechRecognition(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRefLike();

  function useRefLike() {
    return { current: null as SpeechRecognitionLike | null };
  }

  const supported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  function start() {
    if (!supported) {
      setError("Your browser does not support speech recognition. Try Chrome or Edge.");
      return;
    }
    const Ctor: SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition: SpeechRecognitionCtor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition: SpeechRecognitionCtor }).webkitSpeechRecognition;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) onFinal(result[0].transcript.trim());
        else interimText += result[0].transcript;
      }
      setInterim(interimText);
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed") setError("Microphone permission denied. Allow mic access and try again.");
      else if (event.error === "no-speech") setError(null); // normal pause, not an error
      else setError(`Speech recognition error: ${event.error}`);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setError(null);
    rec.start();
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  }

  return { listening, interim, error, supported, start, stop, setError };
}
