import Image from "next/image";
import Link from "next/link";

/**
 * Lockup merek: lambang, nama, dan tagline.
 *
 * Tagline memakai potongan langsung dari artwork logo, bukan font yang mirip —
 * itu satu-satunya cara memastikan hurufnya benar-benar sama. Berkasnya dari
 * hasil perbesaran 4x, jadi tetap tajam di layar beresolusi tinggi.
 */
export function BrandLockup({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 ${className ?? ""}`}
      aria-label="Kayu Pinoes — Woodentoys and Montessori"
    >
      <Image
        src="/images/brand/logo-mark.png"
        alt=""
        width={103}
        height={155}
        priority
        className="h-9 w-auto shrink-0 transition-transform duration-200 group-hover:-rotate-3"
      />
      <span className="flex flex-col">
        <span className="font-display text-[1.45rem] leading-none font-semibold tracking-[-0.06em] text-[#314B3A]">
          Kayu Pinoes
        </span>
        <Image
          src="/images/brand/logo-tagline@4x.png"
          alt="Woodentoys and Montessori"
          width={748}
          height={104}
          className="mt-1.5 h-[13px] w-auto"
        />
      </span>
    </Link>
  );
}
