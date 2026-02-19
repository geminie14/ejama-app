"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Calendar } from "@/app/components/ui/calendar";
import { toast } from "sonner";
import { supabaseUrl, supabaseAnonKey } from "@/utils/supabase/info";
import type { DateRange } from "react-day-picker";
interface PeriodTrackerProps {
  onBack: () => void;
  accessToken: string;
}

const toDateOnly = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"

export function PeriodTracker({ onBack, accessToken }: PeriodTrackerProps) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [loading, setLoading] = useState(false);

     const PERIOD_TRACKING_ENDPOINT =
  "https://qcljtqizujwxmxqrogkg.supabase.co/functions/v1/make-server-1aee76a8/period-tracking";
  
  useEffect(() => {
    if (!accessToken) return;
    loadTrackingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const loadTrackingData = async () => {
  try {
    const res = await fetch(PERIOD_TRACKING_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("loadTrackingData failed:", res.status, json);
      return;
    }

    const data = json?.data;

    if (data?.start_date && data?.end_date) {
      setRange({ from: new Date(data.start_date), to: new Date(data.end_date) });
    }
    if (data?.cycle_length) setCycleLength(String(data.cycle_length));
    if (data?.period_length) setPeriodLength(String(data.period_length));
  } catch (e) {
    console.error("Error loading tracking data:", e);
  }
};

const handleSave = async () => {
  if (!accessToken) return toast.error("Missing session. Please login again.");
  if (!range?.from || !range?.to)
    return toast.error("Please select the start and end date of your period.");

  setLoading(true);

  try {
    const res = await fetch(PERIOD_TRACKING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        start_date: toDateOnly(range.from),
        end_date: toDateOnly(range.to),
        cycle_length: Number(cycleLength),
        period_length: Number(periodLength),
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("handleSave failed:", res.status, json);
      return toast.error(json?.error || "Failed to save tracking data");
    }

    toast.success("Tracking data saved successfully!");
  } catch (e) {
    console.error("Network error saving tracking data:", e);
    toast.error("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            style={{ color: "#A592AB" }}
            className="hover:bg-[#D4C4EC]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#594F62" }}>
            Period Tracker
          </h1>
          <p style={{ color: "#776B7D" }}>
            Track your menstrual cycle and get personalized predictions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#594F62" }}>
                Mark Your Period Days
              </h3>

              <div className="flex justify-center overflow-hidden">
                <div className="w-full">
                  <div className="flex flex-col items-center">
                    <Calendar
                      mode="range"
                      selected={range}
                      onSelect={setRange}
                      numberOfMonths={1}
                      className="rounded-md border"
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      {range?.from && range?.to
                        ? `Selected: ${range.from.toDateString()} - ${range.to.toDateString()}`
                        : "Select the start and end date of your period."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#594F62" }}>
                Cycle Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cycleLength">Cycle Length (days)</Label>
                  <Input
                    id="cycleLength"
                    type="number"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    min="21"
                    max="35"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="periodLength">Period Length (days)</Label>
                  <Input
                    id="periodLength"
                    type="number"
                    value={periodLength}
                    onChange={(e) => setPeriodLength(e.target.value)}
                    min="2"
                    max="7"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full text-white rounded-full"
                  style={{ backgroundColor: "#A592AB" }}
                >
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </Card>

            <Card className="p-4 border" style={{ backgroundColor: "#D4C4EC", borderColor: "#B2A0B9" }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "#594F62" }}>
                Tracking Tips
              </h3>

              <ul className="space-y-1 text-sm" style={{ color: "#594F62" }}>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: "#A592AB" }}>•</span>
                  <span>Mark the first day of your period each month for accurate predictions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: "#A592AB" }}>•</span>
                  <span>Track symptoms like cramps, mood changes, and energy levels</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: "#A592AB" }}>•</span>
                  <span>Be consistent with tracking to improve prediction accuracy</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: "#A592AB" }}>•</span>
                  <span>Consult a healthcare provider if you notice significant changes in your cycle</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
