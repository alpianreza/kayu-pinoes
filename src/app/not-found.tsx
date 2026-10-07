import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#FBF9F3] px-5 py-14">
      <div className="max-w-xl rounded-[2rem] border border-[#314B3A]/12 bg-white p-8 text-center sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C76845]">Halaman tidak ditemukan</p>
        <h1 className="font-display mt-4 text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
          Alamat ini tidak ada
        </h1>
        <p className="mt-4 leading-7 text-[#536459]">
          Halaman yang kamu cari mungkin sudah dipindahkan atau salah ketik.
        </p>
        <div className="mt-7 flex justify-center">
          <Button asChild>
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
