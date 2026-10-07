"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi kesalahan pada halaman:", error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center bg-[#FBF9F3] px-5 py-14">
      <div className="max-w-xl rounded-[2rem] border border-[#314B3A]/12 bg-white p-8 text-center sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C76845]">Terjadi kesalahan</p>
        <h1 className="font-display mt-4 text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
          Halaman ini gagal dimuat
        </h1>
        <p className="mt-4 leading-7 text-[#536459]">
          Maaf, ada yang tidak berjalan sebagaimana mestinya. Coba muat ulang, atau kembali ke beranda.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Coba lagi</Button>
          <Button asChild variant="outline">
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
