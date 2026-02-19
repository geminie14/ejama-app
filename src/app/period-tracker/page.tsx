"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PeriodTracker } from "@/app/components/period-tracker/PeriodTracker";
import { getSupabaseClient } from "@/utils/supabase/client";

export default function PeriodTrackerPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [accessToken, setAccessToken] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? "";
      setAccessToken(token);
    };

    load();

    // keep token updated if session refreshes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? "");
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <PeriodTracker
      onBack={() => router.back()}
      accessToken={accessToken}
    />
  );
}

