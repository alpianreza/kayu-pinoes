import { AlertCircle } from "lucide-react";

const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_ADMIN_EMAIL",
];

export function NotConfiguredScreen() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <div className="rounded-[2rem] border border-[#314B3A]/12 bg-white p-7 shadow-[0_18px_50px_rgba(49,75,58,0.08)] sm:p-10">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#F9E2BE] text-[#8A5A2B]">
          <AlertCircle size={24} />
        </span>
        <h1 className="font-display mt-6 text-3xl tracking-[-0.05em] text-[#294332] sm:text-4xl">
          Belum tersambung ke server data
        </h1>
        <p className="mt-4 leading-7 text-[#536459]">
          Supaya produk bisa disimpan, sambungkan dulu situs ke server datanya. Isi berkas{" "}
          <code className="rounded bg-[#F1EFE7] px-1.5 py-0.5 text-[13px]">.env.local</code> di akar proyek,
          lalu jalankan ulang servernya dengan <code className="rounded bg-[#F1EFE7] px-1.5 py-0.5 text-[13px]">npm run dev</code>.
          Perubahan pada berkas itu baru terbaca setelah server dijalankan ulang.
        </p>
        <ul className="mt-6 grid gap-2 text-sm font-semibold text-[#405047]">
          {REQUIRED_ENV_KEYS.map((key) => (
            <li key={key} className="rounded-xl bg-[#F7F5EE] px-3.5 py-2 font-mono text-[13px]">
              {key}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-6 text-[#6B766E]">
          Enam nilai pertama bisa kamu salin dari konsol Firebase:
          Project settings → General → Your apps → Web app.
          Nilai
          <code className="mx-1 rounded bg-[#F1EFE7] px-1.5 py-0.5 text-[13px]">NEXT_PUBLIC_ADMIN_EMAIL</code>
          harus sama persis dengan email admin di
          <code className="mx-1 rounded bg-[#F1EFE7] px-1.5 py-0.5 text-[13px]">firestore.rules</code> dan
          <code className="mx-1 rounded bg-[#F1EFE7] px-1.5 py-0.5 text-[13px]">storage.rules</code>.
        </p>
      </div>
    </div>
  );
}
