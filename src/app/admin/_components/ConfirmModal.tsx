"use client";

import { AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", onKeyDown);
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";
  const isWarning = variant === "warning";

  return (
    <div className="kp-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-[#1B241E]/60 backdrop-blur-[3px]">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="kp-modal-panel w-full max-w-md rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_24px_60px_rgba(49,75,58,0.18)] outline-none sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                isDanger
                  ? "bg-[#F9E7DF] text-[#C76845]"
                  : isWarning
                    ? "bg-[#FDF3D6] text-[#A3781F]"
                    : "bg-[#EEF1E9] text-[#314B3A]"
              }`}
            >
              {isDanger ? (
                <AlertTriangle size={24} />
              ) : isWarning ? (
                <AlertTriangle size={24} />
              ) : (
                <Info size={24} />
              )}
            </div>

            <Button variant="ghost" size="icon" aria-label="Tutup" onClick={onCancel}>
              <X size={18} />
            </Button>
          </div>

          <h3 id="confirm-modal-title" className="font-display mt-5 text-2xl tracking-[-0.04em] text-[#27372D]">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#6B766E]">{description}</p>

          <div className="mt-7 flex flex-wrap justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              size="sm"
              className={
                isDanger
                  ? "bg-[#C76845] text-white hover:bg-[#B25634]"
                  : isWarning
                    ? "bg-[#A3781F] text-white hover:bg-[#866116]"
                    : undefined
              }
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
