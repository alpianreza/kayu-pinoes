"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Kesalahan fatal pada aplikasi:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#FBF9F3",
          color: "#27372D",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "34rem", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 1rem",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#C76845",
            }}
          >
            Terjadi kesalahan
          </p>
          <h1 style={{ margin: "0 0 1rem", fontSize: "2rem", lineHeight: 1.1, color: "#294332" }}>
            Aplikasi gagal dimuat
          </h1>
          <p style={{ margin: "0 0 1.75rem", lineHeight: 1.6, color: "#536459" }}>
            Maaf, ada yang tidak berjalan sebagaimana mestinya. Coba muat ulang halaman ini.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "9999px",
              border: "none",
              background: "#314B3A",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
