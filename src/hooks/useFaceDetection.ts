import { useCallback, useEffect, useRef, useState } from "react";
import type Human from "@vladmandic/human";
import {
  pickLargestFaceBox,
  loadImageFromFile,
} from "@/lib/passport-photo/passport-photo-processing";
import type { FaceBox } from "@/lib/passport-photo/types";

const HUMAN_MODEL_BASE = "https://cdn.jsdelivr.net/npm/@vladmandic/human/models";

let humanSingleton: Human | null = null;
let humanLoadPromise: Promise<Human> | null = null;

async function getHuman(): Promise<Human> {
  if (humanSingleton) return humanSingleton;
  if (humanLoadPromise) return humanLoadPromise;

  humanLoadPromise = (async () => {
    const { default: HumanConstructor } = await import("@vladmandic/human");
    const instance = new HumanConstructor({
      modelBasePath: HUMAN_MODEL_BASE,
      backend: "webgl",
      face: {
        enabled: true,
        detector: { enabled: true, maxDetected: 5, minConfidence: 0.35 },
        mesh: { enabled: false },
        iris: { enabled: false },
        description: { enabled: false },
        emotion: { enabled: false },
      },
      body: { enabled: false },
      hand: { enabled: false },
      object: { enabled: false },
      gesture: { enabled: false },
    });
    await instance.load();
    humanSingleton = instance;
    return instance;
  })();

  return humanLoadPromise;
}

export type UseFaceDetectionState = {
  ready: boolean;
  loading: boolean;
  error: string | null;
  detectLargestFace: (file: File) => Promise<FaceBox | null>;
};

export function useFaceDetection(): UseFaceDetectionState {
  const humanRef = useRef<Human | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const human = await getHuman();
        if (cancelled) return;
        humanRef.current = human;
        setReady(true);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Face detection failed to initialize.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const detectLargestFace = useCallback(async (file: File): Promise<FaceBox | null> => {
    const human = humanRef.current ?? (await getHuman());
    humanRef.current = human;

    const image = await loadImageFromFile(file);
    const result = await human.detect(image);
    const faces = result.face ?? [];
    return pickLargestFaceBox(faces);
  }, []);

  return {
    ready,
    loading,
    error,
    detectLargestFace,
  };
}
