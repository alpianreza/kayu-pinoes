"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

import { Notice } from "./Notice";
import { TextField } from "./TextField";

export function AdminLogin({
  email,
  password,
  error,
  signingIn,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  email: string;
  password: string;
  error: string | null;
  signingIn: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="mx-auto max-w-md px-5 py-14 sm:px-8">
      <form
        className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-7 shadow-[0_18px_50px_rgba(49,75,58,0.08)] sm:p-9"
        onSubmit={onSubmit}
      >
        <h1 className="font-display text-3xl tracking-[-0.05em] text-[#294332]">Masuk sebagai admin</h1>
        <p className="mt-3 text-sm leading-6 text-[#6B766E]">
          Masuk menggunakan email dan kata sandi akun Supabase Auth yang terdaftar sebagai admin.
        </p>

        {error ? (
          <div className="mt-6">
            <Notice kind="error">{error}</Notice>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <TextField label="Email" type="email" autoComplete="email" value={email} onChange={onEmailChange} />
          <div className="relative">
            <TextField
              label="Kata sandi"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              inputClassName="pr-12"
              value={password}
              onChange={onPasswordChange}
            />
            <button
              className="absolute bottom-2.5 right-2.5 grid size-9 place-items-center rounded-full text-[#55645A] transition-colors hover:bg-[#EEF1E9]"
              type="button"
              aria-label={passwordVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              aria-pressed={passwordVisible}
              onClick={() => setPasswordVisible((value) => !value)}
            >
              {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <Button className="mt-7 w-full" size="lg" type="submit" disabled={signingIn}>
          {signingIn ? "Memproses…" : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
