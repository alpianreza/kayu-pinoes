/**
 * Lambang WhatsApp yang digambar ulang secara sederhana sebagai SVG.
 *
 * Ini bukan berkas resmi WhatsApp, melainkan bentuk yang dikenali: lingkaran
 * hijau dengan gelembung pesan dan gagang telepon. Emoji tidak dipakai karena
 * tidak dirender seragam di semua sistem.
 */
export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <path
        fill="#25D366"
        d="M16 2.6C8.6 2.6 2.6 8.6 2.6 16c0 2.4.6 4.6 1.8 6.6L2.6 29.4l7-1.8c1.9 1 4.1 1.6 6.4 1.6 7.4 0 13.4-6 13.4-13.4S23.4 2.6 16 2.6z"
      />
      <path
        fill="#FFFFFF"
        d="M12.7 9.6c-.3-.7-.6-.7-.9-.7h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.2-1.3 2.9 0 1.7 1.3 3.4 1.5 3.6.2.2 2.5 3.9 6.1 5.3 3 1.2 3.6.9 4.3.9.7-.1 2.1-.9 2.4-1.7.3-.9.3-1.6.2-1.7-.1-.2-.4-.3-.8-.4-.4-.2-2.6-1.3-3-1.4-.4-.2-.7-.2-1 .2-.3.4-1.1 1.4-1.3 1.7-.3.3-.5.3-.9.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8.2-.2.5-.6.7-.8.2-.3.3-.5.4-.8.1-.3.1-.5 0-.7-.1-.3-1-2.4-1.3-3.2z"
      />
    </svg>
  );
}
