import { useState, useEffect, useCallback, useRef } from "react";
import type { Alert } from "@/lib/grammar-checker";

export interface UseGrammarCheckerOptions {
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseGrammarCheckerReturn {
  text: string;
  setText: (text: string) => void;
  alerts: Alert[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  score: string | null;
  expandedAlert: number | null;
  setExpandedAlert: (index: number | null) => void;
  wordCount: number;
  hardAlerts: Alert[];
  styleAlerts: Alert[];
  autoFixableAlerts: Alert[];
  checkGrammar: () => Promise<void>;
  reset: () => void;
  showToast: (message: string) => void;
  toastMessage: string | null;
}

export function useGrammarChecker(
  options: UseGrammarCheckerOptions = {}
): UseGrammarCheckerReturn {
  const { debounceMs = 1000, enabled = true } = options;

  const [text, setText] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const grammarDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const grammarRequestInFlightRef = useRef(false);
  const pendingGrammarTextRef = useRef<string>("");
  const pendingGrammarCheckRef = useRef(false);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  }, []);

  const executeGrammarCheck = useCallback(async (sourceText: string) => {
    if (!sourceText.trim()) {
      setAlerts([]);
      setScore(null);
      setError(null);
      return;
    }

    if (grammarRequestInFlightRef.current) {
      pendingGrammarTextRef.current = sourceText;
      pendingGrammarCheckRef.current = true;
      return;
    }

    grammarRequestInFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    setAlerts([]);

    try {
      const res = await fetch("/api/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.error?.includes("429")) {
          alert(
            "Rate limit reached (429 Too Many Requests). Please wait 60 seconds before trying again."
          );
          throw new Error("Rate limit exceeded. Please wait 60 seconds.");
        }
        throw new Error(data.error || "Grammar check failed");
      }

      setAlerts(data.alerts || []);
      const nonStyleCount = (data.alerts || []).filter(
        (a: Alert) => a.category !== "Style"
      ).length;
      setScore(
        nonStyleCount === 0 ? "Perfect Score" : `${nonStyleCount} issue(s)`
      );
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Something went wrong";
      setError(errMsg);
      setScore("Error");
    } finally {
      grammarRequestInFlightRef.current = false;
      setIsLoading(false);

      if (pendingGrammarCheckRef.current && pendingGrammarTextRef.current.trim()) {
        const queuedText = pendingGrammarTextRef.current;
        pendingGrammarCheckRef.current = false;
        pendingGrammarTextRef.current = "";
        void executeGrammarCheck(queuedText);
      }
    }
  }, []);

  const checkGrammar = useCallback(async () => {
    await executeGrammarCheck(text);
  }, [text, executeGrammarCheck]);

  const reset = useCallback(() => {
    setAlerts([]);
    setScore(null);
    setError(null);
    setExpandedAlert(null);
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const hardAlerts = alerts.filter((alert) => alert.category !== "Style");
  const styleAlerts = alerts.filter((alert) => alert.category === "Style");
  const autoFixableAlerts = hardAlerts.filter(
    (alert) => alert.replacements && alert.replacements.length > 0
  );

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (grammarDebounceRef.current) {
        clearTimeout(grammarDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (grammarDebounceRef.current) {
      clearTimeout(grammarDebounceRef.current);
    }

    if (!text.trim()) {
      setAlerts([]);
      setScore(null);
      setError(null);
      return;
    }

    if (!enabled) {
      return;
    }

    grammarDebounceRef.current = setTimeout(() => {
      void executeGrammarCheck(text);
    }, debounceMs);

    return () => {
      if (grammarDebounceRef.current) {
        clearTimeout(grammarDebounceRef.current);
      }
    };
  }, [text, enabled, debounceMs, executeGrammarCheck]);

  return {
    text,
    setText,
    alerts,
    isLoading,
    setIsLoading,
    error,
    score,
    expandedAlert,
    setExpandedAlert,
    wordCount,
    hardAlerts,
    styleAlerts,
    autoFixableAlerts,
    checkGrammar,
    reset,
    showToast,
    toastMessage,
  };
}
