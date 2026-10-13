/**
 * Lambang Instagram yang digambar ulang secara sederhana sebagai SVG.
 *
 * Ini bukan berkas resmi Instagram, melainkan bentuk yang dikenali: kotak
 * membulat dengan lensa dan titik sudut. Emoji tidak dipakai karena tidak
 * dirender seragam di semua sistem.
 */
export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <line x1="17.6" y1="6.4" x2="17.61" y2="6.4" />
    </svg>
  );
}
