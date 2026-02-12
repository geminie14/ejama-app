import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "@/utils/supabase/info";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl) throw new Error("Supabase URL missing");
    if (!supabaseAnonKey) throw new Error("Supabase anon key missing");

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

