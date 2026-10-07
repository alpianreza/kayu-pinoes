import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export function Notice({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  const isError = kind === "error";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
        isError
          ? "border-[#C76845]/30 bg-[#F9E7DF] text-[#8A3F23]"
          : "border-[#527A58]/30 bg-[#E3EDE1] text-[#2F5236]"
      }`}
      role={isError ? "alert" : "status"}
    >
      {isError ? (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}
