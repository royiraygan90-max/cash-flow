"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import Icon from "./Icon";

interface ToastState {
  id: number;
  type: "success" | "error";
  message: string;
  detail?: string;
}

interface ToastContextValue {
  showToast: (opts: { type: "success" | "error"; message: string; detail?: string }) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [exiting, setExiting] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    setExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setToast(null);
      setExiting(false);
    }, 200);
  }, []);

  const showToast = useCallback(
    ({ type, message, detail }: { type: "success" | "error"; message: string; detail?: string }) => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      setExiting(false);
      setToast({ id: Date.now(), type, message, detail });
      dismissTimerRef.current = setTimeout(dismiss, 2800);
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <style>{`
        @keyframes toast-in {
          from { transform: translateY(-12px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes toast-out {
          from { transform: translateY(0);     opacity: 1; }
          to   { transform: translateY(-12px); opacity: 0; }
        }
        .toast-enter { animation: toast-in  200ms ease forwards; }
        .toast-exit  { animation: toast-out 200ms ease forwards; }
      `}</style>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "max(16px, calc(env(safe-area-inset-top) + 12px))",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          <div
            onClick={dismiss}
            className={exiting ? "toast-exit" : "toast-enter"}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              maxWidth: "calc(100% - 32px)",
              ...(toast.type === "success"
                ? { background: "#101a16", border: "1px solid #1c3329" }
                : { background: "#1c1316", border: "1px solid #3a2226" }),
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 24px -8px rgba(0,0,0,.5)",
              fontFamily: "Rubik, sans-serif",
            }}
          >
            <span style={{ color: toast.type === "success" ? "#34e0a1" : "#ff6b6b", display: "flex", flexShrink: 0 }}>
              <Icon name={toast.type === "success" ? "check_circle" : "error"} size={20} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#f2f5f8" }}>{toast.message}</span>
              {toast.detail && (
                <span style={{ fontSize: 12, color: "#7c8896" }}>{toast.detail}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
