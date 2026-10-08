"use client";

import Link from "next/link";
import { LogOut, TreePine } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase";

import { AdminHeader } from "./_components/AdminHeader";
import { AdminLogin } from "./_components/AdminLogin";
import { AdminMobileNav } from "./_components/AdminMobileNav";
import { AdminSidebar } from "./_components/AdminSidebar";
import { NotConfiguredScreen } from "./_components/NotConfiguredScreen";
import { ToastProvider } from "./_components/Toaster";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim().toLowerCase();

function signInErrorMessage(error: { message?: string }): string {
  const raw = (error.message ?? "").toLowerCase();

  if (raw.includes("invalid login credentials")) return "Email atau kata sandi salah.";
  if (raw.includes("email not confirmed")) return "Email belum dikonfirmasi - cek kotak masuk emailmu.";
  if (raw.includes("rate limit") || raw.includes("too many")) {
    return "Terlalu banyak percobaan masuk. Tunggu sebentar, lalu coba lagi.";
  }

  return error.message || "Gagal masuk. Coba lagi.";
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAdmin =
    Boolean(user) &&
    ADMIN_EMAIL.length > 0 &&
    (user?.email ?? "").trim().toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    const client = supabaseClient();
    if (!client) return;

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const client = supabaseClient();
    if (!client) return;

    setSigningIn(true);
    setAuthError(null);

    try {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(signInErrorMessage(error));
        return;
      }

      setPassword("");
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    const client = supabaseClient();
    if (!client) return;
    await client.auth.signOut();
  }

  if (!isSupabaseConfigured) {
    return <NotConfiguredScreen />;
  }

  if (!authReady) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#FBF9F3] px-5 py-16 text-center text-sm font-bold text-[#6B766E]">
        <div className="flex flex-col items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#314B3A] text-white">
            <TreePine size={24} />
          </span>
          <p>Memeriksa status otentikasi Supabase…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-[#FBF9F3]">
        <header className="border-b border-[#314B3A]/10 bg-[#FBF9F3]/95 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#D98B64] text-sm font-black text-white">
                K
              </span>
              <div>
                <p className="font-display text-xl leading-none tracking-[-0.05em] text-[#314B3A]">
                  Kayu Pinoes
                </p>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#C76845]">
                  Panel Admin CMS
                </p>
              </div>
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Ke Beranda</Link>
            </Button>
          </div>
        </header>

        <AdminLogin
          email={email}
          password={password}
          error={authError}
          signingIn={signingIn}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSignIn}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#FBF9F3] px-5 py-14 sm:px-8">
        <div className="w-full max-w-xl rounded-[2rem] border border-[#C76845]/25 bg-[#F9E7DF] p-7 sm:p-9 shadow-lg">
          <h1 className="font-display text-3xl tracking-[-0.05em] text-[#8A3F23]">
            Akun ini bukan admin
          </h1>
          <p className="mt-4 leading-7 text-[#8A3F23]">
            Kamu masuk sebagai <strong>{user.email}</strong>, tetapi email ini tidak terdaftar sebagai admin Kayu Pinoes.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#8A3F23]">
            {ADMIN_EMAIL.length === 0
              ? "Variabel NEXT_PUBLIC_ADMIN_EMAIL belum diisi di .env.local."
              : `Email admin resmi yang diizinkan: ${ADMIN_EMAIL}`}
          </p>
          <Button className="mt-6" variant="outline" onClick={handleSignOut}>
            <LogOut size={16} /> Keluar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FBF9F3] text-[#27372D]">
      {/* Desktop Sidebar */}
      <AdminSidebar userEmail={user.email ?? null} onSignOut={handleSignOut} />

      {/* Mobile Drawer */}
      <AdminMobileNav
        isOpen={mobileNavOpen}
        userEmail={user.email ?? null}
        onClose={() => setMobileNavOpen(false)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex flex-col lg:ps-64 min-h-dvh">
        <AdminHeader onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-10 max-w-7xl w-full mx-auto">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
