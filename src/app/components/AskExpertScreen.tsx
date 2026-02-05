import { useState, useEffect } from "react";
import { ArrowLeft, Send, Lock, Globe, MessageCircle, CheckCircle } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";
import { projectId } from "/utils/supabase/info";

interface AskExpertScreenProps {
  onBack: () => void;
  accessToken: string;
}

interface Question {
  id: string;
  question: string;
  category: string;
  isPrivate: boolean;
  askedBy: string;
  askedAt: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  status: "pending" | "answered";
}

const categories = [
  "Menstrual Health",
  "Pain Management",
  "Products & Hygiene",
  "Nutrition & Lifestyle",
  "Medical Concerns",
  "Other",
];

export function AskExpertScreen({ onBack, accessToken }: AskExpertScreenProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<"ask" | "browse" | "my-questions">("ask");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadMyQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/ask-expert/questions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const loadMyQuestions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/ask-expert/my-questions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMyQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error loading my questions:", error);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!questionText.trim() || !selectedCategory) {
      toast.error("Please select a category and enter your question");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/ask-expert/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: questionText,
            category: selectedCategory,
            isPrivate,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMyQuestions((prev) => [data.question, ...prev]);
        setQuestionText("");
        setSelectedCategory("");
        setIsPrivate(false);
        toast.success(
          isPrivate
            ? "Your private question has been submitted. You'll receive an answer via the app."
            : "Your question has been submitted! It may appear publicly once answered."
        );
        setActiveTab("my-questions");
      } else {
        toast.error("Failed to submit question");
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Failed to submit question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions =
    filterCategory === "all"
      ? questions
      : questions.filter((q) => q.category === filterCategory);

  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            style={{ color: "#A592AB" }}
            className="hover:bg-[#D4C4EC] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "#594F62" }}>
            Ask the Expert
          </h1>
          <p style={{ color: "#776B7D" }}>
            Get answers to your menstrual health questions from healthcare professionals
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "ask" ? "default" : "outline"}
            onClick={() => setActiveTab("ask")}
            style={
              activeTab === "ask"
                ? { backgroundColor: "#A592AB", color: "white" }
                : { borderColor: "#A592AB", color: "#A592AB" }
            }
          >
            <Send className="w-4 h-4 mr-2" />
            Ask a Question
          </Button>
          <Button
            variant={activeTab === "browse" ? "default" : "outline"}
            onClick={() => setActiveTab("browse")}
            style={
              activeTab === "browse"
                ? { backgroundColor: "#A592AB", color: "white" }
                : { borderColor: "#A592AB", color: "#A592AB" }
            }
          >
            <Globe className="w-4 h-4 mr-2" />
            Browse Q&A
          </Button>
          <Button
            variant={activeTab === "my-questions" ? "default" : "outline"}
            onClick={() => setActiveTab("my-questions")}
            style={
              activeTab === "my-questions"
                ? { backgroundColor: "#A592AB", color: "white" }
                : { borderColor: "#A592AB", color: "#A592AB" }
            }
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            My Questions
          </Button>
        </div>

        {/* Ask a Question Tab */}
        {activeTab === "ask" && (
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4" style={{ color: "#594F62" }}>
              Submit Your Question
            </h2>

            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#594F62" }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  style={{ borderColor: "#D1C1F2" }}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#594F62" }}>
                  Your Question
                </label>
                <Textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Describe your question in detail..."
                  rows={6}
                  className="w-full"
                />
                <p className="text-xs mt-1" style={{ color: "#776B7D" }}>
                  Please be as specific as possible. Remember, this is for general health information
                  only.
                </p>
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-start gap-3 p-4 rounded-md" style={{ backgroundColor: "#F5F0FF" }}>
                <input
                  type="checkbox"
                  id="privacy-toggle"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="privacy-toggle" className="font-medium cursor-pointer" style={{ color: "#594F62" }}>
                    {isPrivate ? (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Private Question
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Public Question
                      </span>
                    )}
                  </label>
                  <p className="text-xs mt-1" style={{ color: "#776B7D" }}>
                    {isPrivate
                      ? "Only you will see the question and answer. It won't be shared publicly."
                      : "This question and answer may be shared publicly to help others in the community."}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitQuestion}
                disabled={isSubmitting}
                className="w-full text-white"
                style={{ backgroundColor: "#A592AB" }}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Question"}
              </Button>

              <Card className="p-4" style={{ backgroundColor: "#FFF9E6", borderColor: "#FFE5A3" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#8B7000" }}>
                  ⚠️ Important Notice
                </p>
                <p className="text-xs" style={{ color: "#8B7000" }}>
                  This service provides general health information only. If you have severe symptoms,
                  heavy bleeding, extreme pain, or a medical emergency, please seek immediate medical
                  attention.
                </p>
              </Card>
            </div>
          </Card>
        )}

        {/* Browse Q&A Tab */}
        {activeTab === "browse" && (
          <div>
            {/* Filter */}
            <div className="mb-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 border rounded-md"
                style={{ borderColor: "#D1C1F2" }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <Card
                    key={q.id}
                    className="p-6 bg-white"
                    style={{ borderLeft: q.status === "answered" ? "4px solid #A592AB" : "4px solid #D1C1F2" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs px-2 py-1 rounded"
                            style={{ backgroundColor: "#E7DDFF", color: "#594F62" }}
                          >
                            {q.category}
                          </span>
                          {q.status === "answered" && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: "#22C55E" }}>
                              <CheckCircle className="w-3 h-3" />
                              Answered
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2" style={{ color: "#594F62" }}>
                          {q.question}
                        </h3>
                        <p className="text-xs" style={{ color: "#9A92AB" }}>
                          Asked {q.askedAt}
                        </p>
                      </div>
                    </div>

                    {q.answer && (
                      <div
                        className="mt-4 p-4 rounded-md"
                        style={{ backgroundColor: "#F5F0FF" }}
                      >
                        <p className="text-sm font-semibold mb-2" style={{ color: "#594F62" }}>
                          Expert Answer
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "#594F62" }}>
                          {q.answer}
                        </p>
                        <p className="text-xs mt-3" style={{ color: "#9A92AB" }}>
                          Answered by {q.answeredBy} • {q.answeredAt}
                        </p>
                      </div>
                    )}

                    {q.status === "pending" && (
                      <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: "#FFF9E6" }}>
                        <p className="text-xs" style={{ color: "#8B7000" }}>
                          ⏳ Waiting for expert response...
                        </p>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-8 bg-white text-center">
                  <p style={{ color: "#776B7D" }}>
                    No questions found in this category yet.
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* My Questions Tab */}
        {activeTab === "my-questions" && (
          <div className="space-y-4">
            {myQuestions.length > 0 ? (
              myQuestions.map((q) => (
                <Card
                  key={q.id}
                  className="p-6 bg-white"
                  style={{ borderLeft: q.status === "answered" ? "4px solid #A592AB" : "4px solid #D1C1F2" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: "#E7DDFF", color: "#594F62" }}
                        >
                          {q.category}
                        </span>
                        {q.isPrivate && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#776B7D" }}>
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        )}
                        {q.status === "answered" && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#22C55E" }}>
                            <CheckCircle className="w-3 h-3" />
                            Answered
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold mb-2" style={{ color: "#594F62" }}>
                        {q.question}
                      </h3>
                      <p className="text-xs" style={{ color: "#9A92AB" }}>
                        Asked {q.askedAt}
                      </p>
                    </div>
                  </div>

                  {q.answer && (
                    <div
                      className="mt-4 p-4 rounded-md"
                      style={{ backgroundColor: "#F5F0FF" }}
                    >
                      <p className="text-sm font-semibold mb-2" style={{ color: "#594F62" }}>
                        Expert Answer
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "#594F62" }}>
                        {q.answer}
                      </p>
                      <p className="text-xs mt-3" style={{ color: "#9A92AB" }}>
                        Answered by {q.answeredBy} • {q.answeredAt}
                      </p>
                    </div>
                  )}

                  {q.status === "pending" && (
                    <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: "#FFF9E6" }}>
                      <p className="text-xs" style={{ color: "#8B7000" }}>
                        ⏳ Your question is being reviewed. You'll be notified once an expert responds.
                      </p>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="p-8 bg-white text-center">
                <p className="mb-4" style={{ color: "#776B7D" }}>
                  You haven't asked any questions yet.
                </p>
                <Button
                  onClick={() => setActiveTab("ask")}
                  style={{ backgroundColor: "#A592AB", color: "white" }}
                >
                  Ask Your First Question
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
