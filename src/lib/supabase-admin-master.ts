import { supabaseClient } from "./supabase";

export type MasterCategory = {
  id: number;
  slug: string;
  sort_order: number;
  is_active: boolean;
  translations: Record<string, string>; // { id: string, en: string, ar: string }
};

export type MasterMaterial = {
  id: number;
  code: string;
  sort_order: number;
  is_active: boolean;
  translations: Record<string, string>;
};

export type MasterFinishing = {
  id: number;
  code: string;
  sort_order: number;
  is_active: boolean;
  translations: Record<string, string>;
};

export type MasterAgeRange = {
  id: number;
  min_months: number;
  max_months: number;
  sort_order: number;
};

function requireClient() {
  const client = supabaseClient();
  if (!client) throw new Error("Situs belum tersambung ke Supabase. Isi .env.local terlebih dahulu.");
  return client;
}

function toError(error: { message?: string } | null, fallback: string): Error {
  return new Error(error?.message || fallback);
}

/* ============================================================================
 * KATEGORI (public.categories & public.category_translations)
 * ============================================================================ */

export async function fetchMasterCategories(): Promise<MasterCategory[]> {
  const client = supabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("categories")
    .select("id, slug, sort_order, is_active, translations:category_translations(language_id, name)")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw toError(error, "Gagal mengambil data kategori.");

  type RawRow = {
    id: number;
    slug: string;
    sort_order: number;
    is_active: boolean;
    translations: Array<{ language_id: string; name: string }> | null;
  };

  const rows = (data ?? []) as unknown as RawRow[];

  return rows.map((row) => {
    const translationMap: Record<string, string> = { id: "", en: "", ar: "" };
    (row.translations ?? []).forEach((t) => {
      translationMap[t.language_id] = t.name;
    });
    return {
      id: Number(row.id),
      slug: row.slug,
      sort_order: row.sort_order,
      is_active: row.is_active,
      translations: translationMap,
    };
  });
}

export async function saveMasterCategory(payload: {
  id?: number;
  slug: string;
  sort_order: number;
  is_active: boolean;
  translations: Record<string, string>;
}): Promise<void> {
  const client = requireClient();

  // 1. Save core category row
  if (payload.id) {
    const { error } = await client
      .from("categories")
      .update({
        slug: payload.slug.trim(),
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      })
      .eq("id", payload.id);
    if (error) throw toError(error, "Gagal memperbarui kategori.");
  } else {
    const { data, error } = await client
      .from("categories")
      .insert({
        slug: payload.slug.trim(),
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      })
      .select("id")
      .single();
    if (error) throw toError(error, "Gagal menambahkan kategori.");
    payload.id = data.id;
  }

  // 2. Upsert translations
  const langKeys = ["id", "en", "ar"];
  const translationRows = langKeys.map((lang) => ({
    category_id: payload.id!,
    language_id: lang,
    name: (payload.translations[lang] ?? "").trim(),
  }));

  const { error: transError } = await client
    .from("category_translations")
    .upsert(translationRows, { onConflict: "category_id,language_id" });

  if (transError) throw toError(transError, "Gagal menyimpan terjemahan kategori.");
}

export async function deleteMasterCategory(id: number): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("categories").delete().eq("id", id);
  if (error) throw toError(error, "Gagal menghapus kategori.");
}

/* ============================================================================
 * MATERIAL KAYU (public.materials & public.material_translations)
 * ============================================================================ */

export async function fetchMasterMaterials(): Promise<MasterMaterial[]> {
  const client = supabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("materials")
    .select("id, code, sort_order, is_active, translations:material_translations(language_id, name)")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw toError(error, "Gagal mengambil data material.");

  type RawRow = {
    id: number;
    code: string;
    sort_order: number;
    is_active: boolean;
    translations: Array<{ language_id: string; name: string }> | null;
  };

  const rows = (data ?? []) as unknown as RawRow[];

  return rows.map((row) => {
    const translationMap: Record<string, string> = { id: "", en: "", ar: "" };
    (row.translations ?? []).forEach((t) => {
      translationMap[t.language_id] = t.name;
    });
    return {
      id: Number(row.id),
      code: row.code,
      sort_order: row.sort_order,
      is_active: row.is_active,
      translations: translationMap,
    };
  });
}

export async function saveMasterMaterial(payload: {
  id?: number;
  code: string;
  sort_order: number;
  is_active: boolean;
  translations: Record<string, string>;
}): Promise<void> {
  const client = requireClient();

  if (payload.id) {
    const { error } = await client
      .from("materials")
      .update({
        code: payload.code.trim(),
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      })
      .eq("id", payload.id);
    if (error) throw toError(error, "Gagal memperbarui material kayu.");
  } else {
    const { data, error } = await client
      .from("materials")
      .insert({
        code: payload.code.trim(),
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      })
      .select("id")
      .single();
    if (error) throw toError(error, "Gagal menambahkan material kayu.");
    payload.id = data.id;
  }

  const langKeys = ["id", "en", "ar"];
  const translationRows = langKeys.map((lang) => ({
    material_id: payload.id!,
    language_id: lang,
    name: (payload.translations[lang] ?? "").trim(),
  }));

  const { error: transError } = await client
    .from("material_translations")
    .upsert(translationRows, { onConflict: "material_id,language_id" });

  if (transError) throw toError(transError, "Gagal menyimpan terjemahan material kayu.");
}

export async function deleteMasterMaterial(id: number): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("materials").delete().eq("id", id);
  if (error) throw toError(error, "Gagal menghapus material kayu.");
}

/* ============================================================================
 * FINISHING & LAPISAN (public.finishings & public.finishing_translations)
 * ============================================================================ */

export async function fetchMasterFinishings(): Promise<MasterFinishing[]> {
  const client = supabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("finishings")
    .select("id, code, sort_order, is_active, translations:finishing_translations(language_id, name)")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw toError(error, "Gagal mengambil data finishing.");

  type RawRow = {
    id: number;
    code: string;
    sort_order: number;
    is_active: boolean;
    translations: Array<{ language_id: string; name: string }> | null;
  };

  const rows = (data ?? []) as unknown as RawRow[];

  return rows.map((row) => {
    const translationMap: Record<string, string> = { id: "", en: "", ar: "" };
    (row.translations ?? []).forEach((t) => {
      translationMap[t.language_id] = t.name;
    });
    return {
      id: Number(row.id),
      code: row.code,
      sort_order: row.sort_order,
      is_active: row.is_active,
      translations: translationMap,
    };
  });
}

export async function saveMasterFinishing(payload: {
  id?: number;
  code: string;
  sort_order: number;
  is_active: boolean;
  translations: Record<string, string>;
}): Promise<void> {
  const client = requireClient();

  if (payload.id) {
    const { error } = await client
      .from("finishings")
      .update({
        code: payload.code.trim(),
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      })
      .eq("id", payload.id);
    if (error) throw toError(error, "Gagal memperbarui finishing.");
  } else {
    const { data, error } = await client
      .from("finishings")
      .insert({
        code: payload.code.trim(),
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      })
      .select("id")
      .single();
    if (error) throw toError(error, "Gagal menambahkan finishing.");
    payload.id = data.id;
  }

  const langKeys = ["id", "en", "ar"];
  const translationRows = langKeys.map((lang) => ({
    finishing_id: payload.id!,
    language_id: lang,
    name: (payload.translations[lang] ?? "").trim(),
  }));

  const { error: transError } = await client
    .from("finishing_translations")
    .upsert(translationRows, { onConflict: "finishing_id,language_id" });

  if (transError) throw toError(transError, "Gagal menyimpan terjemahan finishing.");
}

export async function deleteMasterFinishing(id: number): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("finishings").delete().eq("id", id);
  if (error) throw toError(error, "Gagal menghapus finishing.");
}

/* ============================================================================
 * RENTANG USIA (public.age_ranges)
 * ============================================================================ */

export async function fetchMasterAgeRanges(): Promise<MasterAgeRange[]> {
  const client = supabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("age_ranges")
    .select("id, min_months, max_months, sort_order")
    .order("sort_order", { ascending: true })
    .order("min_months", { ascending: true });

  if (error) throw toError(error, "Gagal mengambil data rentang usia.");

  return (data ?? []).map((row) => ({
    id: Number(row.id),
    min_months: Number(row.min_months),
    max_months: Number(row.max_months),
    sort_order: Number(row.sort_order),
  }));
}

export async function saveMasterAgeRange(payload: {
  id?: number;
  min_months: number;
  max_months: number;
  sort_order: number;
}): Promise<void> {
  const client = requireClient();

  if (payload.id) {
    const { error } = await client
      .from("age_ranges")
      .update({
        min_months: payload.min_months,
        max_months: payload.max_months,
        sort_order: payload.sort_order,
      })
      .eq("id", payload.id);
    if (error) throw toError(error, "Gagal memperbarui rentang usia.");
  } else {
    const { error } = await client.from("age_ranges").insert({
      min_months: payload.min_months,
      max_months: payload.max_months,
      sort_order: payload.sort_order,
    });
    if (error) throw toError(error, "Gagal menambahkan rentang usia.");
  }
}

export async function deleteMasterAgeRange(id: number): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("age_ranges").delete().eq("id", id);
  if (error) throw toError(error, "Gagal menghapus rentang usia.");
}
