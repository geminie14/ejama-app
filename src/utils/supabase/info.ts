// src/utils/supabase/info.ts

const viteEnv =
  typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;

export const supabaseUrl =
  (viteEnv?.VITE_SUPABASE_URL as string | undefined) ??
  (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ??
  "";

export const supabaseAnonKey =
  (viteEnv?.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ??
  "";

if (typeof window !== "undefined") {
  console.log("SUPABASE URL:", supabaseUrl);
  console.log("SUPABASE ANON KEY exists:", Boolean(supabaseAnonKey));
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing env vars. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_...) are set."
  );
}

if (supabaseUrl && !/^https?:\/\//.test(supabaseUrl)) {
  console.warn("[Supabase] Supabase URL must start with https://");
}
