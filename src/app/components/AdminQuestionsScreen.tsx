"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, RefreshCw, CheckCircle2, Circle, Clock } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";
import { getSupabaseClient } from "@/utils/supabase/client";

type QuestionRow = {
  id: number;
  created_at: string;
  question: string;
  category: string | null;
  answered: boolean;
  answer: string | null;
};

type FilterStatus = "all" | "unanswered" | "answered";

interface AdminQuestionsScreenProps {
  onBack: () => void;
    accessToken?: string;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AdminQuestionsScreen({ onBack }: AdminQuestionsScreenProps) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState<QuestionRow[]>([]);
  const [selected, setSelected] = useState<QuestionRow | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [category, setCategory] = useState<string>("all");

  const [draftAnswer, setDraftAnswer] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.category?.trim()) set.add(r.category.trim());
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((r) => {
      const matchSearch =
        !q ||
        r.question.toLowerCase().includes(q) ||
        (r.answer || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q);

      const matchStatus =
        status === "all" ? true : status === "answered" ? r.answered : !r.answered;

      const matchCategory = category === "all" ? true : (r.category || "") === category;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [rows, search, status, category]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("id, created_at, question, category, answered, answer")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error(error.message || "Failed to load questions");
        return;
      }

      setRows((data || []) as QuestionRow[]);

           if (selected) {
        const updated = (data || []).find((r: any) => r.id === selected.id) as QuestionRow | undefined;
        setSelected(updated || null);
        setDraftAnswer(updated?.answer || "");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error while loading questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
   
  }, []);

  useEffect(() => {
    setDraftAnswer(selected?.answer || "");
  }, [selected]);

  const openRow = (r: QuestionRow) => {
    setSelected(r);
    setDraftAnswer(r.answer || "");
  };

  const markAnswered = async (answered: boolean) => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload: Partial<QuestionRow> = { answered };

      if (answered) payload.answer = draftAnswer?.trim() || null;

      const { error } = await supabase.from("questions").update(payload).eq("id", selected.id);
      if (error) {
        console.error(error);
        toast.error(error.message || "Failed to update status");
        return;
      }

      toast.success(answered ? "Marked as answered" : "Marked as unanswered");
      await fetchQuestions();
    } catch (e) {
      console.error(e);
      toast.error("Network error while updating question");
    } finally {
      setSaving(false);
    }
  };

  const saveAnswer = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const answer = draftAnswer?.trim() || null;
      const { error } = await supabase
        .from("questions")
        .update({
          answer,
          answered: !!answer, 
        })
        .eq("id", selected.id);

      if (error) {
        console.error(error);
        toast.error(error.message || "Failed to save answer");
        return;
      }

      toast.success("Saved");
      await fetchQuestions();
    } catch (e) {
      console.error(e);
      toast.error("Network error while saving answer");
    } finally {
      setSaving(false);
    }
  };

  const pill =
    "text-xs font-semibold px-3 py-1 rounded-full bg-white border border-[#D4C4EC] text-[#594F62] hover:bg-[#F6F2FF]";

  return (
    <div className="min-h-screen bg-[#E7DDFF] relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#DCCFFF] to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            style={{ color: "#A592AB" }}
            className="hover:bg-[#D4C4EC]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={fetchQuestions}
            disabled={loading}
            className="rounded-xl bg-white text-[#594F62] border border-[#D4C4EC] hover:bg-[#F6F2FF]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="mb-6">
          <div className="text-3xl font-extrabold tracking-tight text-[#4B3F72]">
            Admin • Questions Viewer
          </div>
          <div className="text-sm text-[#8B8196] mt-1">
            Review anonymous questions, add answers, and mark status.
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 rounded-2xl border border-[#D4C4EC] bg-white/70 backdrop-blur-sm shadow-sm mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-md">
              <Label htmlFor="qsearch" className="text-[#594F62]">
                Search
              </Label>
              <div className="relative mt-1">
                <Search className="w-4 h-4 text-[#8B8196] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="qsearch"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search question, answer, or category…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={pill}
                onClick={() => setStatus("all")}
                style={status === "all" ? { backgroundColor: "#F6F2FF" } : undefined}
              >
                All
              </button>
              <button
                type="button"
                className={pill}
                onClick={() => setStatus("unanswered")}
                style={status === "unanswered" ? { backgroundColor: "#F6F2FF" } : undefined}
              >
                Unanswered
              </button>
              <button
                type="button"
                className={pill}
                onClick={() => setStatus("answered")}
                style={status === "answered" ? { backgroundColor: "#F6F2FF" } : undefined}
              >
                Answered
              </button>

              <div className="flex items-center gap-2 ml-1">
                <span className="text-xs font-semibold text-[#594F62]">Category:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-xs px-3 py-2 rounded-full bg-white border border-[#D4C4EC] text-[#594F62] hover:bg-[#F6F2FF]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <Card className="lg:col-span-2 p-3 sm:p-4 rounded-2xl border border-[#D4C4EC] bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-[#594F62]">
                Questions ({filtered.length})
              </div>
              <div className="text-xs text-[#8B8196]">
                Sorted by newest
              </div>
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
              {filtered.length === 0 ? (
                <div className="text-sm text-[#8B8196] p-3">
                  No questions match your filters.
                </div>
              ) : (
                filtered.map((r) => {
                  const isSelected = selected?.id === r.id;

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => openRow(r)}
                      className={[
                        "w-full text-left rounded-2xl border px-4 py-3 transition",
                        isSelected ? "border-[#7C3AED] bg-[#F6F2FF]" : "border-[#E7DDFF] bg-white hover:bg-[#FBFAFF]",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#594F62] truncate">
                            {r.question}
                          </div>
                          <div className="text-xs text-[#8B8196] mt-1">
                            {r.category ? `Category: ${r.category} • ` : ""}
                            {fmtDate(r.created_at)}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {r.answered ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#EDE7FF] text-[#4B3F72] border border-[#D4C4EC]">
                              <CheckCircle2 className="w-4 h-4" />
                              Answered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#594F62] border border-[#D4C4EC]">
                              <Clock className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Detail */}
          <Card className="lg:col-span-3 p-5 sm:p-6 rounded-2xl border border-[#D4C4EC] bg-white shadow-sm">
            {!selected ? (
              <div className="text-sm text-[#8B8196]">
                Select a question from the left to view details and respond.
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="text-lg font-semibold text-[#594F62]">
                      Question #{selected.id}
                    </div>
                    <div className="text-xs text-[#8B8196] mt-1">
                      {selected.category ? `Category: ${selected.category} • ` : ""}
                      {fmtDate(selected.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => markAnswered(false)}
                      disabled={saving}
                      className="rounded-xl bg-white text-[#594F62] border border-[#D4C4EC] hover:bg-[#F6F2FF]"
                    >
                      <Circle className="w-4 h-4 mr-2" />
                      Mark Unanswered
                    </Button>

                    <Button
                      onClick={() => markAnswered(true)}
                      disabled={saving}
                      className="rounded-xl text-white"
                      style={{ backgroundColor: "#7C3AED" }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Answered
                    </Button>
                  </div>
                </div>

                <Card className="p-4 rounded-2xl border border-[#E7DDFF] bg-[#FBFAFF] mb-4">
                  <div className="text-xs font-semibold text-[#8B8196] mb-1">
                    Anonymous Question
                  </div>
                  <div className="text-base font-semibold text-[#594F62]">
                    {selected.question}
                  </div>
                </Card>

                <div className="space-y-2">
                  <Label className="text-[#594F62]">Answer</Label>
                  <Textarea
                    value={draftAnswer}
                    onChange={(e) => setDraftAnswer(e.target.value)}
                    placeholder="Type the answer you want to publish/respond with…"
                    className="min-h-[160px]"
                  />

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    <div className="text-xs text-[#8B8196]">
                      Tip: saving an answer auto-marks the question as <b>answered</b>.
                    </div>

                    <Button
                      onClick={saveAnswer}
                      disabled={saving}
                      className="rounded-xl text-white"
                      style={{ backgroundColor: "#A592AB" }}
                    >
                      {saving ? "Saving..." : "Save Answer"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
