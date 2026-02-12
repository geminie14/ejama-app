"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
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

interface FeedbackScreenProps {
  onBack: () => void;
}

export function FeedbackScreen({ onBack }: FeedbackScreenProps) {
  const [name, setName] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!feedbackType || !feedback.trim()) {
      toast.error("Please select a feedback type and enter your feedback");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.from("feedback").insert([
        {
          name: name.trim() || "Anonymous",
          feedback_type: feedbackType,
          feedback: feedback.trim(),
        },
      ]);

      if (error) throw error;

      toast.success("Thank you for your feedback!");
      setName("");
      setFeedbackType("");
      setFeedback("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-2xl mx-auto">
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
            Feedback
          </h1>
          <p style={{ color: "#776B7D" }}>
            We value your feedback. Help us improve Ejama by sharing your thoughts
            and suggestions.
          </p>
        </div>

        <Card className="p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedbackType">Feedback Type</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="app-experience">App Experience</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="educational-content">
                    Educational Content
                  </SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or concerns..."
                className="min-h-[150px]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white"
              style={{ backgroundColor: "#A592AB" }}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </Card>

        <Card
          className="mt-6 p-6 border"
          style={{ backgroundColor: "#D4C4EC", borderColor: "#B2A0B9" }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#594F62" }}>
            Thank You!
          </h3>
          <p className="text-sm" style={{ color: "#594F62" }}>
            Your feedback helps us improve Ejama and better serve the menstrual health
            needs of women and girls across sub-Saharan Africa.
          </p>
        </Card>
      </div>
    </div>
  );
}
