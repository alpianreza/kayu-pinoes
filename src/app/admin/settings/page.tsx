"use client";

import { CheckCircle2, Database, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { isSupabaseConfigured, PRODUCT_IMAGE_BUCKET, supabaseClient } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const client = supabaseClient();
    if (!client) return;

    client.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C76845]">
          Sistem & Akses
        </span>
        <h1 className="font-display text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
          Pengaturan Admin
        </h1>
        <p className="mt-1 text-sm text-[#6B766E]">
          Informasi profil admin aktif, status koneksi Supabase, dan konfigurasi lingkungan.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_12px_36px_rgba(49,75,58,0.05)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#314B3A] text-white">
            <User size={22} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#27372D]">Akun Admin Aktif</h2>
            <p className="text-xs text-[#6B766E]">Hak akses Super Admin katalog Kayu Pinoes</p>
          </div>
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <div className="rounded-xl bg-[#F7F5EE] p-3.5 space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
              Email Terautentikasi
            </span>
            <p className="font-bold text-sm text-[#27372D]">{user?.email ?? "—"}</p>
          </div>

          <div className="rounded-xl bg-[#F7F5EE] p-3.5 space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
              Allowed Admin Email (.env)
            </span>
            <p className="font-bold text-sm text-[#27372D]">{adminEmail || "—"}</p>
          </div>
        </div>
      </div>

      {/* Database & Supabase Integration Status */}
      <div className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_12px_36px_rgba(49,75,58,0.05)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#C76845] text-white">
            <Database size={22} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#27372D]">Status Integrasi Supabase</h2>
            <p className="text-xs text-[#6B766E]">Koneksi PostgreSQL DB, Auth & Storage</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between rounded-xl bg-[#F7F5EE] px-4 py-3 text-xs font-semibold">
            <span className="text-[#536459]">Koneksi Klien Supabase</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
                isSupabaseConfigured
                  ? "bg-[#DFEBDC] text-[#2F5236]"
                  : "bg-[#F9E7DF] text-[#8A3F23]"
              }`}
            >
              <CheckCircle2 size={13} /> {isSupabaseConfigured ? "Tersambung" : "Terputus"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#F7F5EE] px-4 py-3 text-xs font-semibold">
            <span className="text-[#536459]">Supabase URL</span>
            <span className="font-mono text-[#27372D] truncate max-w-[16rem]">
              {supabaseUrl || "Tidak Dikonfigurasi"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#F7F5EE] px-4 py-3 text-xs font-semibold">
            <span className="text-[#536459]">Storage Bucket Foto Produk</span>
            <span className="font-mono text-[#314B3A] font-bold">{PRODUCT_IMAGE_BUCKET}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#F7F5EE] px-4 py-3 text-xs font-semibold">
            <span className="text-[#536459]">Fungsi RPC Database Active</span>
            <span className="text-[#2F5236] font-bold">
              upsert_product, delete_product, swap_product_order
            </span>
          </div>
        </div>
      </div>

      {/* System Specifications */}
      <div className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-6 shadow-[0_12px_36px_rgba(49,75,58,0.05)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#8A5A2B] text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#27372D]">Spesifikasi & Keamanan CMS</h2>
            <p className="text-xs text-[#6B766E]">Platform & Keamanan RLS</p>
          </div>
        </div>

        <ul className="divide-y divide-[#314B3A]/8 text-xs font-medium text-[#536459]">
          <li className="flex justify-between py-2.5">
            <span>Framework Core</span>
            <span className="font-bold text-[#27372D]">Next.js 16 (App Router)</span>
          </li>
          <li className="flex justify-between py-2.5">
            <span>Styling Engine</span>
            <span className="font-bold text-[#27372D]">Tailwind CSS v4</span>
          </li>
          <li className="flex justify-between py-2.5">
            <span>Security Mechanism</span>
            <span className="font-bold text-[#27372D]">PostgreSQL Row Level Security (RLS)</span>
          </li>
          <li className="flex justify-between py-2.5">
            <span>Firebase Status</span>
            <span className="font-bold text-[#2F5236]">Dihapus Sepenuhnya (Cleaned)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
