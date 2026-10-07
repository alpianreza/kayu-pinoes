"use client";

import type { ReactNode } from "react";

export function KpiCard({
  title,
  value,
  description,
  icon,
  accentColor = "#314B3A",
  loading = false,
}: {
  title: string;
  value: number | string;
  description?: string;
  icon: ReactNode;
  accentColor?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_12px_36px_rgba(49,75,58,0.05)] transition hover:shadow-[0_18px_45px_rgba(49,75,58,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#748077]">
          {title}
        </span>
        <div
          className="grid size-10 place-items-center rounded-2xl text-white shadow-xs"
          style={{ backgroundColor: accentColor }}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-9 w-20 animate-pulse rounded-xl bg-[#EEF1E9]" />
        ) : (
          <span className="font-display text-4xl tracking-[-0.055em] text-[#27372D]">
            {value}
          </span>
        )}
      </div>

      {description ? (
        <p className="mt-2 text-xs font-semibold text-[#8A948C]">{description}</p>
      ) : null}
    </div>
  );
}
