"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCameraStream } from "./useCameraStream";

const MODEL_URL = "/models/face_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const SAMPLE_INTERVAL_MS = 500;
const WINDOW_MS = 5000;
const WARMUP_MS = 5000;
const MIN_FRAME_QUALITY = 0.55;

type FaceLandmarker = import("@mediapipe/tasks-vision").FaceLandmarker;
type Landmark = import("@mediapipe/tasks-vision").NormalizedLandmark;

export interface FaceFrameObservation {
  timestamp: number;
  faceCount: number;
  frameQuality: number;
  brightnessQuality: number;
  sharpnessQuality: number;
  faceBounds: { x: number; y: number; width: number; height: number } | null;
  headYawProxy: number | null;
  headPitchProxy: number | null;
  headFacingCameraProxy: number | null;
  smileMovement: number | null;
  browMovement: number | null;
  mouthMovement: number | null;
  expressionMovement: number | null;
  faceMotionStability: number | null;
}

export interface FaceAnalysisSummary {
  schemaVersion: 2;
  status: "available" | "low_quality" | "insufficient_data";
  warmupComplete: boolean;
  windowStart: number;
  windowEnd: number;
  sampleCount: number;
  usableSampleCount: number;
  facePresenceRatio: number;
  singleFaceRatio: number;
  frameQuality: number;
  brightnessQuality: number;
  sharpnessQuality: number;
  headFacingCameraRatio: number | null;
  headYawProxyMean: number | null;
  headPitchProxyMean: number | null;
  smileMovementMean: number | null;
  browMovementMean: number | null;
  mouthMovementMean: number | null;
  expressionMovementMean: number | null;
  expressionMovementVariability: number | null;
  faceMotionStability: number | null;
  faceTrackingConfidence: null;
  gazeDirection: null;
  occlusion: null;
  limitations: string[];
}

export interface FaceScannerState {
  active: boolean;
  currentData: FaceFrameObservation | null;
  summary: FaceAnalysisSummary | null;
  warmupProgress: number;
  error: string | null;
  videoRef: (node: HTMLVideoElement | null) => void;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export interface FaceScannerOptions {
  externalStream?: MediaStream | null;
  enabled?: boolean;
  onSummary?: (summary: FaceAnalysisSummary) => void;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function mean(values: Array<number | null>): number | null {
  const usable = values.filter((value): value is number => value !== null && Number.isFinite(value));
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null;
}

function standardDeviation(values: Array<number | null>): number | null {
  const average = mean(values);
  const usable = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (average === null || usable.length < 2) return null;
  return Math.sqrt(usable.reduce((sum, value) => sum + (value - average) ** 2, 0) / usable.length);
}

function measureFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { quality: 0, brightnessQuality: 0, sharpnessQuality: 0 };
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const luminance = new Float32Array(canvas.width * canvas.height);
  let brightnessTotal = 0;

  for (let index = 0; index < luminance.length; index += 1) {
    const offset = index * 4;
    const value = pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114;
    luminance[index] = value;
    brightnessTotal += value;
  }

  const brightness = brightnessTotal / luminance.length;
  const brightnessQuality = clamp01(1 - Math.abs(brightness - 128) / 128);
  let edgeTotal = 0;
  let edgeSquaredTotal = 0;
  let count = 0;
  for (let y = 1; y < canvas.height - 1; y += 1) {
    for (let x = 1; x < canvas.width - 1; x += 1) {
      const index = y * canvas.width + x;
      const edge = 4 * luminance[index] - luminance[index - 1] - luminance[index + 1] - luminance[index - canvas.width] - luminance[index + canvas.width];
      edgeTotal += edge;
      edgeSquaredTotal += edge * edge;
      count += 1;
    }
  }
  const edgeMean = edgeTotal / count;
  const sharpnessQuality = clamp01(Math.sqrt(Math.max(0, edgeSquaredTotal / count - edgeMean ** 2)) / 24);
  return {
    quality: clamp01(brightnessQuality * 0.45 + sharpnessQuality * 0.55),
    brightnessQuality,
    sharpnessQuality,
  };
}

function summarize(samples: FaceFrameObservation[], warmupComplete: boolean): FaceAnalysisSummary {
  const usable = samples.filter((sample) => sample.faceCount === 1 && sample.frameQuality >= MIN_FRAME_QUALITY);
  const ratio = (count: number) => samples.length ? count / samples.length : 0;
  const expressionValues = usable.map((sample) => sample.expressionMovement);
  const averageQuality = mean(samples.map((sample) => sample.frameQuality)) ?? 0;
  const limitations = [
    "Facial movement values are visual proxies, not measurements of internal emotion, intent, honesty, or personality.",
    "Camera-facing is estimated from head landmarks; eye gaze is not measured.",
    "MediaPipe does not provide a calibrated tracking-confidence score here; confidence is unknown.",
    "Occlusion is not reliably classified; its status is unknown.",
  ];

  return {
    schemaVersion: 2,
    status: usable.length < 5 ? "insufficient_data" : averageQuality < MIN_FRAME_QUALITY ? "low_quality" : "available",
    warmupComplete,
    windowStart: samples[0]?.timestamp ?? Date.now(),
    windowEnd: samples[samples.length - 1]?.timestamp ?? Date.now(),
    sampleCount: samples.length,
    usableSampleCount: usable.length,
    facePresenceRatio: ratio(samples.filter((sample) => sample.faceCount > 0).length),
    singleFaceRatio: ratio(samples.filter((sample) => sample.faceCount === 1).length),
    frameQuality: averageQuality,
    brightnessQuality: mean(samples.map((sample) => sample.brightnessQuality)) ?? 0,
    sharpnessQuality: mean(samples.map((sample) => sample.sharpnessQuality)) ?? 0,
    headFacingCameraRatio: usable.length ? mean(usable.map((sample) => sample.headFacingCameraProxy)) : null,
    headYawProxyMean: mean(usable.map((sample) => sample.headYawProxy)),
    headPitchProxyMean: mean(usable.map((sample) => sample.headPitchProxy)),
    smileMovementMean: mean(usable.map((sample) => sample.smileMovement)),
    browMovementMean: mean(usable.map((sample) => sample.browMovement)),
    mouthMovementMean: mean(usable.map((sample) => sample.mouthMovement)),
    expressionMovementMean: mean(expressionValues),
    expressionMovementVariability: standardDeviation(expressionValues),
    faceMotionStability: mean(usable.map((sample) => sample.faceMotionStability)),
    faceTrackingConfidence: null,
    gazeDirection: null,
    occlusion: null,
    limitations,
  };
}

function landmarkBounds(landmarks: Landmark[]) {
  if (!landmarks.length) return null;
  const xs = landmarks.map((point) => point.x);
  const ys = landmarks.map((point) => point.y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function useFaceEmotionScanner(options?: FaceScannerOptions): FaceScannerState {
  const camera = useCameraStream();
  const {
    start: startCamera,
    stop: stopCamera,
    error: cameraError,
    stream: cameraStream,
    videoRef: attachVideoRef,
  } = camera;
  const externalStreamMode = options !== undefined && Object.prototype.hasOwnProperty.call(options, "externalStream");
  const [active, setActive] = useState(false);
  const [currentData, setCurrentData] = useState<FaceFrameObservation | null>(null);
  const [summary, setSummary] = useState<FaceAnalysisSummary | null>(null);
  const [warmupProgress, setWarmupProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const loadingRef = useRef<Promise<FaceLandmarker> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisVideoRef = useRef<HTMLVideoElement | null>(null);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const summaryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const samplesRef = useRef<FaceFrameObservation[]>([]);
  const warmupShapesRef = useRef<number[]>([]);
  const baselineExpressionRef = useRef<number | null>(null);
  const previousCenterRef = useRef<{ x: number; y: number } | null>(null);
  const sessionStartRef = useRef(0);
  const runIdRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const onSummaryRef = useRef(options?.onSummary);

  useEffect(() => {
    onSummaryRef.current = options?.onSummary;
  }, [options?.onSummary]);

  const loadLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    if (!loadingRef.current) {
      loadingRef.current = (async () => {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const files = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await FaceLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: "VIDEO",
          numFaces: 2,
          minFaceDetectionConfidence: 0.7,
          minFacePresenceConfidence: 0.7,
          minTrackingConfidence: 0.7,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });
        landmarkerRef.current = landmarker;
        return landmarker;
      })().catch((cause: unknown) => {
        loadingRef.current = null;
        throw cause;
      });
    }
    return loadingRef.current;
  }, []);

  const stopTracking = useCallback(() => {
    runIdRef.current += 1;
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    if (summaryTimerRef.current) clearInterval(summaryTimerRef.current);
    frameTimerRef.current = null;
    summaryTimerRef.current = null;
    analysisVideoRef.current?.pause();
    if (analysisVideoRef.current) analysisVideoRef.current.srcObject = null;
    analysisVideoRef.current = null;
    previousCenterRef.current = null;
    setActive(false);
  }, []);

  const startTracking = useCallback(async (stream: MediaStream) => {
    stopTracking();
    const runId = ++runIdRef.current;
    samplesRef.current = [];
    warmupShapesRef.current = [];
    baselineExpressionRef.current = null;
    previousCenterRef.current = null;
    sessionStartRef.current = Date.now();
    setCurrentData(null);
    setSummary(null);
    setWarmupProgress(0);
    setError(null);

    try {
      const landmarker = await loadLandmarker();
      if (runId !== runIdRef.current) return;

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      analysisVideoRef.current = video;
      await video.play();
      if (runId !== runIdRef.current) return;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error("Camera video did not become ready.")), 5000);
          video.addEventListener("loadeddata", () => {
            window.clearTimeout(timeout);
            resolve();
          }, { once: true });
          video.addEventListener("error", () => {
            window.clearTimeout(timeout);
            reject(new Error("The camera video could not be read."));
          }, { once: true });
        });
      }
      if (runId !== runIdRef.current) return;

      const canvas = document.createElement("canvas");
      setActive(true);
      const processFrame = () => {
        if (runId !== runIdRef.current || !video.videoWidth) return;
        try {
          const now = Date.now();
          const timestamp = Math.max(now, lastFrameTimeRef.current + 1);
          lastFrameTimeRef.current = timestamp;
          const result = landmarker.detectForVideo(video, timestamp);
          const frame = measureFrame(video, canvas);
          const faceCount = result.faceLandmarks.length;
          const landmarks = result.faceLandmarks[0] ?? [];
          const bounds = landmarkBounds(landmarks);
          const singleUsableFace = faceCount === 1 && frame.quality >= MIN_FRAME_QUALITY;
          let headYawProxy: number | null = null;
          let headPitchProxy: number | null = null;
          let headFacingCameraProxy: number | null = null;
          let smileMovement: number | null = null;
          let browMovement: number | null = null;
          let mouthMovement: number | null = null;
          let expressionMovement: number | null = null;
          let faceMotionStability: number | null = null;

          if (singleUsableFace && bounds) {
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const nose = landmarks[1];
            const eyeDistance = leftEye && rightEye ? Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) : 0;
            if (eyeDistance > 0 && nose) {
              const eyeCenterX = (leftEye.x + rightEye.x) / 2;
              const eyeCenterY = (leftEye.y + rightEye.y) / 2;
              headYawProxy = (nose.x - eyeCenterX) / eyeDistance;
              headPitchProxy = (nose.y - eyeCenterY) / Math.max(bounds.height, 0.001);
              headFacingCameraProxy = clamp01(1 - Math.max(Math.abs(headYawProxy) / 0.45, Math.abs(headPitchProxy - 0.28) / 0.35));
            }

            const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
            if (previousCenterRef.current) {
              const movement = Math.hypot(center.x - previousCenterRef.current.x, center.y - previousCenterRef.current.y) / Math.max(bounds.width, 0.001);
              faceMotionStability = clamp01(1 - movement / 0.2);
            }
            previousCenterRef.current = center;

            const blendshapes = new Map((result.faceBlendshapes[0]?.categories ?? []).map((item) => [item.categoryName, item.score]));
            const score = (name: string) => blendshapes.get(name) ?? 0;
            smileMovement = (score("mouthSmileLeft") + score("mouthSmileRight")) / 2;
            browMovement = Math.max(score("browDownLeft"), score("browDownRight"), score("browInnerUp"), score("browOuterUpLeft"), score("browOuterUpRight"));
            mouthMovement = Math.max(score("jawOpen"), score("mouthFunnel"), score("mouthPucker"), score("mouthPressLeft"), score("mouthPressRight"));
            const shapeActivity = (smileMovement + browMovement + mouthMovement) / 3;

            if (now - sessionStartRef.current < WARMUP_MS) {
              warmupShapesRef.current.push(shapeActivity);
            } else {
              baselineExpressionRef.current ??= mean(warmupShapesRef.current);
              if (baselineExpressionRef.current !== null) {
                expressionMovement = clamp01(Math.abs(shapeActivity - baselineExpressionRef.current) * 2);
              }
            }
          } else {
            previousCenterRef.current = null;
          }

          const observation: FaceFrameObservation = {
            timestamp: now,
            faceCount,
            frameQuality: frame.quality,
            brightnessQuality: frame.brightnessQuality,
            sharpnessQuality: frame.sharpnessQuality,
            faceBounds: bounds,
            headYawProxy,
            headPitchProxy,
            headFacingCameraProxy,
            smileMovement,
            browMovement,
            mouthMovement,
            expressionMovement,
            faceMotionStability,
          };
          samplesRef.current.push(observation);
          setCurrentData(observation);
          setWarmupProgress(clamp01((now - sessionStartRef.current) / (WARMUP_MS + WINDOW_MS)));
        } catch (cause) {
          if (runId !== runIdRef.current) return;
          setError(cause instanceof Error ? `Local face analysis stopped: ${cause.message}` : "Local face analysis stopped.");
          if (frameTimerRef.current) clearInterval(frameTimerRef.current);
          if (summaryTimerRef.current) clearInterval(summaryTimerRef.current);
          setActive(false);
        }
      };

      processFrame();
      frameTimerRef.current = setInterval(processFrame, SAMPLE_INTERVAL_MS);
      summaryTimerRef.current = setInterval(() => {
        if (runId !== runIdRef.current) return;
        const now = Date.now();
        const elapsed = now - sessionStartRef.current;
        const warm = elapsed >= WARMUP_MS;
        const ready = elapsed >= WARMUP_MS + WINDOW_MS;
        const recent = ready ? samplesRef.current.filter((sample) => sample.timestamp >= now - WINDOW_MS) : [];
        const nextSummary = summarize(recent, warm);
        setSummary(nextSummary);
        if (ready) onSummaryRef.current?.(nextSummary);
      }, WINDOW_MS);
    } catch (cause) {
      if (runId !== runIdRef.current) return;
      setError(cause instanceof Error ? cause.message : "Could not start local face analysis.");
      setActive(false);
    }
  }, [loadLandmarker, stopTracking]);

  useEffect(() => {
    if (!externalStreamMode) return;
    if (options.enabled && options.externalStream) void startTracking(options.externalStream);
    else stopTracking();
    return stopTracking;
  }, [externalStreamMode, options?.enabled, options?.externalStream, startTracking, stopTracking]);

  const start = useCallback(async () => {
    setError(null);
    if (externalStreamMode) {
      if (options.externalStream) await startTracking(options.externalStream);
      else setError("Turn on the camera before starting local face analysis.");
      return;
    }
    const stream = await startCamera();
    if (!stream) {
      setError(cameraError ?? "Could not access the camera.");
      return;
    }
    await startTracking(stream);
  }, [externalStreamMode, options?.externalStream, startTracking, startCamera, cameraError]);

  const stop = useCallback(() => {
    if (samplesRef.current.length) {
      setSummary(summarize(samplesRef.current, Date.now() - sessionStartRef.current >= WARMUP_MS));
    }
    stopTracking();
    if (!externalStreamMode) stopCamera();
  }, [stopTracking, externalStreamMode, stopCamera]);

  const reset = useCallback(() => {
    samplesRef.current = [];
    warmupShapesRef.current = [];
    baselineExpressionRef.current = null;
    setCurrentData(null);
    setSummary(null);
    setWarmupProgress(0);
    setError(null);
  }, []);

  useEffect(() => () => {
    runIdRef.current += 1;
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    if (summaryTimerRef.current) clearInterval(summaryTimerRef.current);
    analysisVideoRef.current?.pause();
    if (analysisVideoRef.current) analysisVideoRef.current.srcObject = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  }, []);

  const previewRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    attachVideoRef(node);
    if (node && cameraStream) {
      node.srcObject = cameraStream;
      void node.play().catch(() => undefined);
    }
  }, [attachVideoRef, cameraStream]);

  return { active, currentData, summary, warmupProgress, error, videoRef: previewRef, start, stop, reset };
}