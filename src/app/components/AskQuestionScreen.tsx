"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { toast } from "sonner";
import { getSupabaseClient } from "@/utils/supabase/client";

interface AskQuestionScreenProps {
  onBack: () => void;
}

export function AskQuestionScreen({ onBack }: AskQuestionScreenProps) {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error("Please enter your question");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.from("questions").insert([
        {
          question: question.trim(),
          category: category || null,
        },
      ]);

      if (error) throw error;

      toast.success("Your question has been submitted anonymously 💜");

      setQuestion("");
      setCategory("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to submit question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#594F62" }}>
            Ask Ejama 💜
          </h1>
          <p style={{ color: "#776B7D" }}>
            Ask any question about periods, menstrual health, or products.  
            This is 100% anonymous and safe.
          </p>
        </div>

        {/* Form */}
        <Card className="p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category (Optional)</Label>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="cycle">Cycle & Periods</SelectItem>
                  <SelectItem value="pain">Cramps & Pain</SelectItem>
                  <SelectItem value="products">Pads / Cups / Tampons</SelectItem>
                  <SelectItem value="pregnancy">Pregnancy & Fertility</SelectItem>
                  <SelectItem value="health">General Health</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label>Your Question</Label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here... (completely anonymous)"
                className="min-h-[150px]"
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white"
              style={{ backgroundColor: "#A592AB" }}
            >
              {loading ? "Submitting..." : "Submit Question"}
            </Button>
          </form>
        </Card>

        {/* Info card */}
        <Card
          className="mt-6 p-6 border"
          style={{ backgroundColor: "#D4C4EC", borderColor: "#B2A0B9" }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "#594F62" }}
          >
            Your privacy matters
          </h3>

          <p className="text-sm" style={{ color: "#594F62" }}>
            Ejama does not store your name or identity with questions.  
            We use your questions to create helpful educational content for girls
            and women across Sub-Saharan Africa.
          </p>
        </Card>
      </div>
    </div>
  );
}
