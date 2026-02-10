import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          storageKey: "ejama-auth",
        },
      }
    );
  }
  return supabaseInstance;
}

