import { Blocks, Puzzle } from "lucide-react";

import { type ProductIllustration } from "@/lib/products";

/**
 * Gambar pengganti untuk produk yang belum punya foto.
 *
 * Dipisah dari halaman beranda supaya bisa dipakai bersama oleh panel admin -
 * di sana gambar ini tampil sebagai pratinjau kecil di sebelah pilihan
 * ilustrasi, sehingga admin tahu bentuknya sebelum memilih.
 *
 * Semua bentuk digambar dengan elemen CSS, tanpa berkas gambar, supaya tidak
 * ada permintaan jaringan tambahan dan warnanya mudah disesuaikan.
 */
const SHAPES: Record<ProductIllustration, React.ReactNode> = {
  // Bentuk netral: cincin, bola, dan kubus kayu.
  mainan: (
    <>
      <div className="absolute size-32 rounded-full border-[16px] border-[#D68759] shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.06)]" />
      <div className="absolute bottom-[22%] right-[23%] size-16 rounded-full bg-[#F0C55F] shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute left-[25%] top-[25%] size-11 rounded-[1rem] bg-[#8FAF97] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.08)]" />
    </>
  ),

  // Pelangi susun: lima lengkung bertingkat.
  rainbow: (
    <>
      <div className="absolute bottom-7 left-1/2 h-28 w-48 -translate-x-1/2 rounded-t-full border-[15px] border-[#D6885B]" />
      <div className="absolute bottom-7 left-1/2 h-24 w-40 -translate-x-1/2 rounded-t-full border-[14px] border-[#F4C45D]" />
      <div className="absolute bottom-7 left-1/2 h-20 w-32 -translate-x-1/2 rounded-t-full border-[13px] border-[#97AE95]" />
      <div className="absolute bottom-7 left-1/2 h-16 w-24 -translate-x-1/2 rounded-t-full border-[12px] border-[#7898A9]" />
      <div className="absolute bottom-7 left-1/2 h-12 w-16 -translate-x-1/2 rounded-t-full border-[11px] border-[#E49A7C]" />
      <div className="absolute bottom-4 left-8 size-7 rounded-md bg-[#E49A7C] shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.07)]" />
      <div className="absolute bottom-4 right-8 size-7 rounded-md bg-[#F3C45E] shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.07)]" />
    </>
  ),

  // Mobil kayu: badan, kabin, dua roda.
  car: (
    <>
      <div className="absolute right-8 top-7 size-10 rounded-full bg-white/40" />
      <div className="absolute bottom-[30%] h-20 w-48 rounded-[2rem_2.7rem_1.2rem_1.2rem] bg-[#D98659] shadow-[inset_-8px_-8px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[48%] left-[32%] h-13 w-24 rounded-t-[3rem] bg-[#F6E8C5]" />
      <div className="absolute bottom-[20%] left-[28%] size-9 rounded-full border-[5px] border-[#5C453A] bg-[#E7D1B7]" />
      <div className="absolute bottom-[20%] right-[28%] size-9 rounded-full border-[5px] border-[#5C453A] bg-[#E7D1B7]" />
      <div className="absolute bottom-[44%] right-[31%] h-4 w-6 rounded-full bg-[#F3C45E]" />
    </>
  ),

  // Balok: kubus, balok tinggi, dan bola.
  blocks: (
    <>
      <div className="absolute bottom-8 left-[23%] h-20 w-20 rounded-lg bg-[#D68759] shadow-[inset_-7px_-7px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-8 left-[43%] h-30 w-20 rounded-lg bg-[#F0C55F] shadow-[inset_-7px_-7px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-8 right-[21%] size-16 rounded-full bg-[#8FAF97] shadow-[inset_-7px_-7px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[57%] left-[35%] flex size-14 items-center justify-center rounded-lg bg-[#F8EFE0] text-[#B56041] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.05)]">
        <Blocks size={28} strokeWidth={1.6} />
      </div>
    </>
  ),

  // Puzzle: keping miring dan dua bulatan warna.
  puzzle: (
    <>
      <div className="absolute size-36 rotate-[-8deg] rounded-[2rem] bg-[#F6D776] shadow-[inset_-8px_-8px_0_rgba(0,0,0,0.07)]" />
      <div className="absolute left-[29%] top-[31%] size-14 rounded-full bg-[#E08A63]" />
      <div className="absolute bottom-[22%] right-[29%] size-12 rounded-full bg-[#89A8B8]" />
      <Puzzle className="relative text-[#476C61]" size={76} strokeWidth={1.4} />
    </>
  ),

  // Hewan: kepala dengan dua telinga bulat dan moncong terang.
  hewan: (
    <>
      <div className="absolute bottom-[26%] size-22 rounded-full bg-[#C97F4F] shadow-[inset_-7px_-7px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[58%] left-[26%] size-11 rounded-full bg-[#C97F4F] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[58%] right-[26%] size-11 rounded-full bg-[#C97F4F] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[19%] size-11 rounded-full bg-[#F6E8C5]" />
      <div className="absolute bottom-[35%] left-[37%] size-3 rounded-full bg-[#5C453A]" />
      <div className="absolute bottom-[35%] right-[37%] size-3 rounded-full bg-[#5C453A]" />
      <div className="absolute bottom-[26%] size-4 rounded-full bg-[#7A5B44]" />
    </>
  ),

  // Boneka: kepala bulat di atas badan membulat.
  // Boneka: kepala bulat dengan wajah, di atas badan membulat. Wajahnya
  // ditempel langsung ke elemen kepala supaya proporsinya ikut ukuran
  // kepala, bukan ukuran kotak.
  boneka: (
    <>
      <div className="absolute bottom-[47%] size-16 rounded-full bg-[#F6E8C5] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.06)]">
        <div className="absolute left-[28%] top-[38%] size-2.5 rounded-full bg-[#5C453A]" />
        <div className="absolute right-[28%] top-[38%] size-2.5 rounded-full bg-[#5C453A]" />
        <div className="absolute bottom-[24%] left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-full bg-[#C08A6A]" />
      </div>
      <div className="absolute bottom-[14%] h-26 w-21 rounded-[3rem_3rem_1.4rem_1.4rem] bg-[#D68759] shadow-[inset_-7px_-7px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[21%] left-[27%] h-10 w-4 rounded-full bg-[#C97F4F]" />
      <div className="absolute bottom-[21%] right-[27%] h-10 w-4 rounded-full bg-[#C97F4F]" />
    </>
  ),

  // Menara susun: gelang mengecil di atas tiang.
  menara: (
    <>
      <div className="absolute bottom-[8%] h-10 w-40 rounded-full bg-[#D68759] shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.07)]" />
      <div className="absolute bottom-[26%] h-9 w-32 rounded-full bg-[#F0C55F] shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.07)]" />
      <div className="absolute bottom-[43%] h-8 w-24 rounded-full bg-[#8FAF97] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.07)]" />
      <div className="absolute bottom-[59%] h-7 w-16 rounded-full bg-[#D98659] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.07)]" />
      <div className="absolute bottom-[72%] size-7 rounded-full bg-[#F6E8C5] shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.06)]" />
    </>
  ),

  // Alat musik: empat bilah nada memendek dan satu pemukul.
  musik: (
    <>
      <div className="absolute bottom-[24%] left-[24%] h-5 w-40 rounded-full bg-[#D68759] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[33%] left-[24%] h-5 w-34 rounded-full bg-[#F0C55F] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[42%] left-[24%] h-5 w-28 rounded-full bg-[#8FAF97] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[51%] left-[24%] h-5 w-22 rounded-full bg-[#D98659] shadow-[inset_-5px_-5px_0_rgba(0,0,0,0.08)]" />
      <div className="absolute bottom-[62%] left-[30%] h-2 w-28 rotate-[-22deg] rounded-full bg-[#8A6A4F]" />
      <div className="absolute bottom-[66%] left-[24%] size-5 rounded-full bg-[#F6E8C5] shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.06)]" />
    </>
  ),

  // Jam: papan bulat dengan dua jarum.
  jam: (
    <>
      <div className="relative grid size-36 place-items-center rounded-full border-[10px] border-[#D68759] bg-[#F8EFE0] shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.05)]">
        <div className="absolute bottom-1/2 left-[calc(50%-3px)] h-11 w-1.5 origin-bottom -rotate-[35deg] rounded-full bg-[#8A6A4F]" />
        <div className="absolute bottom-1/2 left-[calc(50%-3px)] h-14 w-1.5 origin-bottom rotate-[22deg] rounded-full bg-[#5C453A]" />
        <div className="absolute size-4 rounded-full bg-[#C76845]" />
        <div className="absolute top-[14%] size-2 rounded-full bg-[#B9A184]" />
        <div className="absolute bottom-[14%] size-2 rounded-full bg-[#B9A184]" />
        <div className="absolute left-[14%] size-2 rounded-full bg-[#B9A184]" />
        <div className="absolute right-[14%] size-2 rounded-full bg-[#B9A184]" />
      </div>
    </>
  ),
};

export function ToyArtwork({
  illustration,
  className = "",
}: {
  illustration: ProductIllustration;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`.trim()}
    >
      {SHAPES[illustration] ?? SHAPES.mainan}
    </div>
  );
}
