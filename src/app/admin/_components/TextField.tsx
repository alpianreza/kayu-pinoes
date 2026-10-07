import type { Path, RegisterOptions, UseFormRegister } from "react-hook-form";

/**
 * Kolom isian panel admin.
 *
 * Dua mode, sesuai kebutuhan:
 *   - terkontrol (`value` + `onChange`) - dipakai form login yang kecil;
 *   - tidak terkontrol (`register` + `name` dari react-hook-form) - dipakai
 *     formulir produk, sehingga ketikan tidak me-render ulang seluruh panel
 *     dan pesan galat bisa tampil per kolom (`error`).
 *
 * `name` bertipe Path<TFieldValues>: titik dalam string ("translations.id.name")
 * divalidasi terhadap bentuk formulir, jadi kolom yang salah ketik tertangkap
 * saat build, bukan saat admin menekan Simpan.
 */
export function TextField<TFieldValues extends Record<string, unknown>>({
  label,
  value,
  onChange,
  register,
  name,
  options,
  multiline,
  hint,
  error,
  disabled,
  type = "text",
  autoComplete,
  inputClassName,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  /** register dari useForm - hanya boleh dipakai bersamaan dengan `name`. */
  register?: UseFormRegister<TFieldValues>;
  name?: Path<TFieldValues>;
  options?: RegisterOptions<TFieldValues>;
  multiline?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  type?: string;
  autoComplete?: string;
  inputClassName?: string;
}) {
  const registration = register && name !== undefined ? register(name, options) : undefined;

  const shared =
    "w-full rounded-xl border border-[#314B3A]/15 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27372D] outline-none transition focus:border-[#C76845] focus:ring-2 focus:ring-[#C76845]/25 disabled:bg-[#F1EFE7] disabled:text-[#8A948C]";

  const stateClass = error ? " border-[#C0503A] ring-1 ring-[#C0503A]/30" : "";

  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#748077]">
        {label}
      </span>
      {multiline ? (
        registration ? (
          <textarea
            className={`${shared} min-h-24 resize-y${stateClass} ${inputClassName ?? ""}`}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            {...registration}
          />
        ) : (
          <textarea
            className={`${shared} min-h-24 resize-y${stateClass} ${inputClassName ?? ""}`}
            value={value}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            onChange={(event) => onChange?.(event.target.value)}
          />
        )
      ) : registration ? (
        <input
          className={`${shared}${stateClass} ${inputClassName ?? ""}`}
          type={type}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          {...registration}
        />
      ) : (
        <input
          className={`${shared}${stateClass} ${inputClassName ?? ""}`}
          type={type}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange?.(event.target.value)}
        />
      )}
      {error ? (
        <span className="mt-1 block text-xs font-bold text-[#B23C22]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs font-medium text-[#8A948C]">{hint}</span>
      ) : null}
    </label>
  );
}
