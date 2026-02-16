// utils/supabase/info.ts
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing env vars. Check Vercel Environment Variables."
  );
}
