"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraStreamState {
  /** The active MediaStream, or null if not started / permission denied. */
  stream: MediaStream | null;
  /** Whether the camera is currently active. */
  active: boolean;
  /** Human-readable error message, or null. */
  error: string | null;
  /** Whether the browser supports getUserMedia. */
  supported: boolean;
  /** Start the camera stream. Requests permission if needed. */
  start: () => Promise<MediaStream | null>;
  /** Stop the camera stream and release resources. */
  stop: () => void;
  /** Toggle camera stream on/off. */
  toggle: () => void;
  /** Callback ref to attach to a <video> element for rendering. */
  videoRef: (node: HTMLVideoElement | null) => void;
}

/**
 * Custom hook for managing a browser camera stream.
 *
 * Handles getUserMedia lifecycle, permission errors, and cleanup on unmount.
 * Attach `videoRef` to a `<video>` element to render the feed.
 */
export function useCameraStream(): CameraStreamState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoNodeRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia;

  /** Callback ref — attaches the stream whenever the <video> mounts. */
  const videoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoNodeRef.current = node;
      if (node && streamRef.current) {
        node.srcObject = streamRef.current;
        void node.play().catch(() => {
          setError("Camera is connected, but the video preview could not start. Check browser autoplay or camera permissions.");
        });
      }
    },
    [],
  );

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // ignore
      }
    });
    streamRef.current = null;
    if (videoNodeRef.current) {
      videoNodeRef.current.srcObject = null;
    }
    setStream(null);
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    if (!supported) {
      setError("Your browser does not support camera access.");
      return null;
    }

    stop();
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false, // Audio is handled separately by useGeminiLive.
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setActive(true);

      if (videoNodeRef.current) {
        videoNodeRef.current.srcObject = mediaStream;
        await videoNodeRef.current.play().catch((playError: unknown) => {
          const message = playError instanceof Error ? playError.message : "Playback was blocked.";
          setError(`Camera is connected, but the video preview could not start. ${message}`);
        });
      }
      return mediaStream;
    } catch (err) {
      const msg =
        err instanceof DOMException
          ? err.name === "NotAllowedError"
            ? "Camera permission was denied. Please allow camera access in your browser settings."
            : err.name === "NotFoundError"
              ? "No camera found. Please connect a camera and try again."
              : `Camera error: ${err.message}`
          : "Could not access the camera.";
      setError(msg);
      setActive(false);
      return null;
    }
  }, [supported, stop]);

  useEffect(() => {
    const video = videoNodeRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch((playError: unknown) => {
      const message = playError instanceof Error ? playError.message : "Playback was blocked.";
      setError(`Camera is connected, but the video preview could not start. ${message}`);
    });
  }, [stream]);

  const toggle = useCallback(() => {
    if (active) {
      stop();
    } else {
      void start();
    }
  }, [active, start, stop]);

  // Cleanup on tab hide, page unload, or component unmount.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", stop);
    window.addEventListener("beforeunload", stop);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", stop);
      window.removeEventListener("beforeunload", stop);
      stop();
    };
  }, [stop]);

  return { stream, active, error, supported, start, stop, toggle, videoRef };
}
