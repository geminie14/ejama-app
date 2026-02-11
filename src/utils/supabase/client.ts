import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,

          // ✅ prevents SSR crash in Next.js
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
          storageKey: "ejama-auth",
        },
      }
    );
  }

  return supabaseInstance;
}
