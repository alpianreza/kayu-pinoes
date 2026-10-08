"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type ToastKind = "error" | "success";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  showToast: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Lama tampil sebelum hilang sendiri: sukses lebih singkat, galat lebih lama. */
const AUTO_DISMISS_MS: Record<ToastKind, number> = {
  success: 4000,
  error: 6000,
};

/**
 * Papan notifikasi melayang untuk seluruh panel admin.
 *
 * Halaman admin memanggil `useToast().showToast("success" | "error", pesan)`
 * setiap selesai menyimpan/mengubah/menghapus. Toast muncul di pojok atas,
 * boleh bertumpuk, dan hilang sendiri - bisa juga ditutup manual.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (kind: ToastKind, message: string) => {
      const text = message.trim();
      if (text.length === 0) return;

      const id = nextIdRef.current++;
      setToasts((current) => [...current, { id, kind, message: text }]);

      const timer = window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS[kind]);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-center gap-2 sm:left-auto sm:right-6 sm:items-end"
      >
        {toasts.map((toast) => {
          const isError = toast.kind === "error";

          return (
            <div
              key={toast.id}
              role={isError ? "alert" : "status"}
              className={`kp-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_14px_40px_rgba(54,65,52,0.18)] backdrop-blur-sm ${
                isError
                  ? "border-[#C76845]/30 bg-[#F9E7DF]/95 text-[#8A3F23]"
                  : "border-[#527A58]/30 bg-[#E3EDE1]/95 text-[#2F5236]"
              }`}
            >
              {isError ? (
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              )}
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 rounded-full p-0.5 text-current/70 transition-colors hover:bg-black/5 hover:text-current"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Akses papan notifikasi; hanya valid di dalam `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>.");
  }

  return context;
}