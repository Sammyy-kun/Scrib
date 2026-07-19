import { useState, useEffect, useCallback, useRef } from "react";

export interface UseGrammarCheckerReturn {
  text: string;
  setText: (text: string) => void;
  correctedText: string | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  wordCount: number;
  checkGrammar: () => Promise<void>;
  reset: () => void;
  showToast: (message: string) => void;
  toastMessage: string | null;
}

export function useGrammarChecker(): UseGrammarCheckerReturn {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  }, []);

  const checkGrammar = useCallback(async () => {
    if (!text.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setCorrectedText(null);

    try {
      const res = await fetch("/api/check-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.error?.includes("429")) {
          alert("Rate limit reached (429 Too Many Requests). Please wait 60 seconds before trying again.");
          throw new Error("Rate limit exceeded. Please wait 60 seconds.");
        }
        throw new Error(data.error || "Grammar check failed");
      }

      const corrected = data.correctedText || text;
      setCorrectedText(corrected);
      setText(corrected);
      showToast("Grammar corrected");
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Something went wrong";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [text, showToast]);

  const reset = useCallback(() => {
    setCorrectedText(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return {
    text,
    setText,
    correctedText,
    isLoading,
    setIsLoading,
    error,
    setError,
    wordCount,
    checkGrammar,
    reset,
    showToast,
    toastMessage,
  };
}
