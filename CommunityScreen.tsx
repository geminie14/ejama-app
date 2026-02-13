import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  MessageCirclePlus,
  Plus,
  HelpCircle,
  BookOpenText,
  Send,
} from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { projectId } from "@/utils/supabase/info";

interface CommunityScreenProps {
  onBack: () => void;
  accessToken: string;
}

type ForumCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  membersCount: number;
  createdBy?: string;
};


type Thread = {
  id: string;
  categoryId: string;
  title: string;
  createdBy: string;
  createdAt: string;
};

type Post = {
  id: string;
  threadId: string;
  author: string;
  createdAt: string;
  content: string;
  likes: number;
};

function nowLabel() {
  const d = new Date();
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
const DEFAULT_CATEGORIES: ForumCategory[] = [
  {
    id: "c-1",
    title: "Menstrual Health Basics",
    description: "Ask questions, share experiences, learn the basics.",
    icon: "🩸",
    membersCount: 124,
  },
  {
    id: "c-2",
    title: "Products & Access",
    description: "Talk about pads, tampons, cups, brands, and availability.",
    icon: "🧻",
    membersCount: 78,
  },
  {
    id: "c-3",
    title: "Cramps & Pain Support",
    description: "Home tips, comfort routines, when to seek help.",
    icon: "💆🏽‍♀️",
    membersCount: 56,
  },
  {
    id: "c-4",
    title: "Myths & Stigma",
    description: "Break stigma, share facts, and support each other.",
    icon: "💬",
    membersCount: 91,
  },
];

export function CommunityScreen({ onBack, accessToken }: CommunityScreenProps) {
  // ✅ Categories
const [categories, setCategories] = useState<ForumCategory[]>(DEFAULT_CATEGORIES);
const [creatingCommunity, setCreatingCommunity] = useState(false);
const [newCommunityTitle, setNewCommunityTitle] = useState("");
const [newCommunityDescription, setNewCommunityDescription] = useState("");
const [newCommunityIcon, setNewCommunityIcon] = useState("💬");
// Q&A mode inside Community
const [qaMode, setQaMode] = useState<"home" | "ask" | "browse">("home");

// Ask form
const [qaCategory, setQaCategory] = useState("general");
const [qaQuestion, setQaQuestion] = useState("");
const [qaSubmitting, setQaSubmitting] = useState(false);

// Browse list
type QaItem = {
  id: string;
  question: string;
  answer?: string | null;
  category?: string | null;
  status?: "answered" | "unanswered" | string;
  created_at?: string;
  answered_at?: string | null;
};
const [qaItems, setQaItems] = useState<QaItem[]>([]);
const [qaLoading, setQaLoading] = useState(false);
const [qaQuery, setQaQuery] = useState("");
const [qaFilter, setQaFilter] = useState<"all" | "answered" | "unanswered">("answered");

const QA_SUBMIT_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/questions/submit`;
const QA_LIST_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/questions/list`;
 

  // ✅ Threads (seed data)
  const [threads, setThreads] = useState<Thread[]>([]);

  // ✅ Posts (seed data)
  const [posts, setPosts] = useState<Post[]>([]);

  // ✅ Navigation state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // ✅ Membership (local state for now)
const [joinedCategoryIds, setJoinedCategoryIds] = useState<string[]>([]);

useEffect(() => {
  if (qaMode === "browse") {
    loadAnsweredQuestions();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [qaMode, qaFilter]);


useEffect(() => {
  loadCommunityData();
}, []);

const loadCommunityData = async () => {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/community/data`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
      

  const incomingCategories = data.categories ?? [];
  setCategories(incomingCategories.length > 0 ? incomingCategories : DEFAULT_CATEGORIES);

  setThreads(data.threads ?? []);
  setPosts(data.posts ?? []);
  setJoinedCategoryIds(data.joinedCategories ?? []);

      } else {
  setCategories(DEFAULT_CATEGORIES);
  setThreads([]);
  setPosts([]);
  setJoinedCategoryIds([]);
}

  } catch (error) {
    console.error("Error loading community data:", error);
  }
};

const isMember = (categoryId: string) => joinedCategoryIds.includes(categoryId);

const joinCommunity = async (categoryId: string) => {
  setJoinedCategoryIds((prev) => (prev.includes(categoryId) ? prev : [...prev, categoryId]));
  
  try {
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/community/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId, join: true }),
      }
    );
    toast.success("Joined community!");
  } catch (error) {
    console.error("Error joining community:", error);
  }
};

const leaveCommunity = async (categoryId: string) => {
  setJoinedCategoryIds((prev) => prev.filter((id) => id !== categoryId));
  
  try {
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/community/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId, join: false }),
      }
    );
    toast.success("Left community");
  } catch (error) {
    console.error("Error leaving community:", error);
  }
};

const createCommunity = async () => {
  const title = newCommunityTitle.trim();
  const description = newCommunityDescription.trim();
  
  if (!title || !description) {
    toast.error("Please fill in all fields");
    return;
  }

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/community/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          title, 
          description, 
          icon: newCommunityIcon 
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      setCategories(prev => [data.category, ...prev]);
      setNewCommunityTitle("");
      setNewCommunityDescription("");
      setNewCommunityIcon("💬");
      setCreatingCommunity(false);
      toast.success("Community created!");
    }
  } catch (error) {
    console.error("Error creating community:", error);
    toast.error("Failed to create community");
  }
};
const submitAnonymousQuestion = async () => {
  const q = qaQuestion.trim();
  if (!q) return toast.error("Please type your question.");

  setQaSubmitting(true);
  try {
    const res = await fetch(QA_SUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        question: q,
        category: qaCategory,
        // Optional: lets you use it later to show "your question" after refresh without identity.
        // Keep if you want; safe to remove.
        client_generated_id: `q_${Date.now()}`,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return toast.error(data?.error || "Failed to submit question.");
    }

    toast.success("Question submitted! Check back in Community → Browse Answered Questions.");
    setQaQuestion("");
    setQaCategory("general");
    setQaMode("home");
  } catch (e) {
    console.error("submitAnonymousQuestion error:", e);
    toast.error("Network error. Please try again.");
  } finally {
    setQaSubmitting(false);
  }
};

const loadAnsweredQuestions = async () => {
  setQaLoading(true);
  try {
    const url = new URL(QA_LIST_URL);
    url.searchParams.set("filter", qaFilter); // answered | unanswered | all
    if (qaQuery.trim()) url.searchParams.set("q", qaQuery.trim());

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setQaItems([]);
      return toast.error(data?.error || "Failed to load questions.");
    }

    setQaItems(Array.isArray(data?.items) ? data.items : []);
  } catch (e) {
    console.error("loadAnsweredQuestions error:", e);
    toast.error("Network error. Please try again.");
  } finally {
    setQaLoading(false);
  }
};
  
  // ✅ New thread form
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);

  // ✅ New post form
  const [newPostText, setNewPostText] = useState("");

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || null;
  const selectedThread = threads.find((t) => t.id === selectedThreadId) || null;

  const threadsInCategory = useMemo(() => {
    if (!selectedCategoryId) return [];
    return threads.filter((t) => t.categoryId === selectedCategoryId);
  }, [threads, selectedCategoryId]);

  const postsInThread = useMemo(() => {
    if (!selectedThreadId) return [];
    return posts.filter((p) => p.threadId === selectedThreadId);
  }, [posts, selectedThreadId]);

  // ✅ Back button (step-by-step)
 const handleBackClick = () => {
  if (selectedThreadId) {
    setSelectedThreadId(null);
    return;
  }
  if (selectedCategoryId) {
    setSelectedCategoryId(null);
    setCreatingThread(false);
    setNewThreadTitle("");
    return;
  }

  // Q&A back handling
  if (qaMode !== "home") {
    setQaMode("home");
    return;
  }

  onBack();
};

  const headerTitle = selectedThread
    ? "Discussion"
    : selectedCategory
    ? selectedCategory.title
    : "Community Forum";

  const headerSubtitle = selectedThread
    ? selectedThread.title
    : selectedCategory
    ? selectedCategory.description
    : "Ask questions, share experiences, and support each other.";

  const createThread = () => {
    if (!selectedCategoryId) return;
    const title = newThreadTitle.trim();
    if (!title) return;

    const newThread: Thread = {
      id: `t-${Date.now()}`,
      categoryId: selectedCategoryId,
      title,
      createdBy: "You",
      createdAt: "Just now",
    };

    setThreads((prev) => [newThread, ...prev]);
    setNewThreadTitle("");
    setCreatingThread(false);
    setSelectedThreadId(newThread.id);
  };

  const addPost = () => {
    if (!selectedThreadId) return;
    const text = newPostText.trim();
    if (!text) return;

    const newPost: Post = {
      id: `p-${Date.now()}`,
      threadId: selectedThreadId,
      author: "You",
      createdAt: nowLabel(),
      content: text,
      likes: 0,
    };

    setPosts((prev) => [...prev, newPost]);
    setNewPostText("");
  };

  const likePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Button variant="ghost" onClick={handleBackClick} className="px-2 mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: "#594F62" }}>
              {headerTitle}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
              {headerSubtitle}
            </p>
          </div>
        </div>

        <Card className="p-4 bg-white">
  <h3 className="font-semibold" style={{ color: "#594F62" }}>Community</h3>
  <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
    Ask anonymously, learn from answers, and connect with others.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
    <Button
      className="w-full text-white justify-start"
      style={{ backgroundColor: "#A592AB" }}
      onClick={() => setQaMode("ask")}
    >
      <HelpCircle className="w-4 h-4 mr-2" />
      Ask a Question (Anonymous)
    </Button>

    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => setQaMode("browse")}
    >
      <BookOpenText className="w-4 h-4 mr-2" />
      Browse Answered Questions
    </Button>
 {/* VIEW Q&A: Ask */}
{qaMode === "ask" && !selectedCategoryId && !selectedThreadId && (
  <div className="space-y-4">
    <Card className="p-4 bg-white space-y-3">
      <div>
        <h3 className="font-semibold" style={{ color: "#594F62" }}>
          Ask a Question (Anonymous)
        </h3>
        <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
          Your name won’t be shown. Check back in “Browse Answered Questions” to see responses.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <select
          value={qaCategory}
          onChange={(e) => setQaCategory(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
        >
          <option value="general">General</option>
          <option value="pain">Pain / cramps</option>
          <option value="cycle">Cycle / tracking</option>
          <option value="products">Products & access</option>
          <option value="health">Health concerns</option>
          <option value="stigma">Myths & stigma</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Your question</Label>
        <Textarea
          value={qaQuestion}
          onChange={(e) => setQaQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="min-h-[120px]"
        />
        <p className="text-xs" style={{ color: "#9A92AB" }}>
          If you have severe symptoms or feel unsafe, seek medical help immediately.
        </p>
      </div>

      <Button
        disabled={qaSubmitting}
        className="w-full text-white"
        style={{ backgroundColor: "#A592AB" }}
        onClick={submitAnonymousQuestion}
      >
        <Send className="w-4 h-4 mr-2" />
        {qaSubmitting ? "Submitting..." : "Submit Question"}
      </Button>

      <Button variant="outline" className="w-full" onClick={() => setQaMode("home")}>
        Cancel
      {/* VIEW Q&A: Browse */}
{qaMode === "browse" && !selectedCategoryId && !selectedThreadId && (
  <div className="space-y-4">
    <Card className="p-4 bg-white space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold" style={{ color: "#594F62" }}>
            Browse Answered Questions
          </h3>
          <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
            Search and read answers. New answers appear here after the team responds.
          </p>
        </div>

        <Button variant="outline" onClick={loadAnsweredQuestions}>
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          value={qaQuery}
          onChange={(e) => setQaQuery(e.target.value)}
          placeholder="Search questions..."
        />
        <div className="flex gap-2">
          <Button
            variant={qaFilter === "answered" ? "default" : "outline"}
            className={qaFilter === "answered" ? "text-white" : ""}
            style={qaFilter === "answered" ? { backgroundColor: "#A592AB" } : {}}
            onClick={() => setQaFilter("answered")}
          >
            Answered
          </Button>
          <Button
            variant={qaFilter === "unanswered" ? "default" : "outline"}
            className={qaFilter === "unanswered" ? "text-white" : ""}
            style={qaFilter === "unanswered" ? { backgroundColor: "#A592AB" } : {}}
            onClick={() => setQaFilter("unanswered")}
          >
            Unanswered
          </Button>
          <Button
            variant={qaFilter === "all" ? "default" : "outline"}
            className={qaFilter === "all" ? "text-white" : ""}
            style={qaFilter === "all" ? { backgroundColor: "#A592AB" } : {}}
            onClick={() => setQaFilter("all")}
          >
            All
          </Button>

          <Button variant="outline" onClick={loadAnsweredQuestions}>
            Search
          </Button>
        </div>
      </div>
    </Card>

    {qaLoading ? (
      <Card className="p-4 bg-white">
        <p className="text-sm" style={{ color: "#776B7D" }}>Loading...</p>
      </Card>
    ) : qaItems.length === 0 ? (
      <Card className="p-4 bg-white">
        <p className="text-sm font-semibold" style={{ color: "#594F62" }}>
          No questions found
        </p>
        <p className="text-xs mt-1" style={{ color: "#776B7D" }}>
          Try a different search, or switch filters.
        </p>
      </Card>
    ) : (
      <div className="space-y-3">
        {qaItems.map((item) => (
          <Card key={item.id} className="p-4 bg-white">
            <p className="text-xs" style={{ color: "#9A92AB" }}>
              Category: {item.category || "general"} • Status: {item.status || (item.answer ? "answered" : "unanswered")}
            </p>

            <p className="text-sm font-semibold mt-2" style={{ color: "#594F62" }}>
              {item.question}
            </p>

            {item.answer ? (
              <div className="mt-3 p-3 rounded-md" style={{ backgroundColor: "#F4F0FF" }}>
                <p className="text-xs font-semibold" style={{ color: "#776B7D" }}>
                  Answer
                </p>
                <p className="text-sm mt-1" style={{ color: "#594F62" }}>
                  {item.answer}
                </p>
              </div>
            ) : (
              <p className="text-sm mt-3" style={{ color: "#776B7D" }}>
                Not answered yet.
              </p>
            )}
          </Card>
        ))}
      </div>
    )}

    <Button variant="outline" className="w-full" onClick={() => setQaMode("home")}>
      Back to Community
    </Button>
  </div>
)}



       {/* VIEW 1: Categories */}
{!selectedCategoryId && !selectedThreadId && qaMode === "home" && (
  <div className="space-y-4">
    {/* Create community button */}
    {!creatingCommunity && (
      <Button
        className="w-full text-white"
        style={{ backgroundColor: "#A592AB" }}
        onClick={() => setCreatingCommunity(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create a new community
      </Button>
    )}

    {/* Q&A entry points */}
<Card className="p-4 bg-white">
  <h3 className="font-semibold" style={{ color: "#594F62" }}>
    Community Q&A
  </h3>
  <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
    Ask anonymously and browse answers from the Ejama team.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
    <Button
      className="w-full text-white justify-start"
      style={{ backgroundColor: "#A592AB" }}
      onClick={() => setQaMode("ask")}
    >
      <HelpCircle className="w-4 h-4 mr-2" />
      Ask a Question (Anonymous)
    </Button>

    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => setQaMode("browse")}
    >
      <BookOpenText className="w-4 h-4 mr-2" />
      Browse Answered Questions
    </Button>
  </div>
</Card>

    {/* Create community form */}
    {creatingCommunity && (
      <Card className="p-4 bg-white space-y-3">
        <div>
          <h3 className="font-semibold" style={{ color: "#594F62" }}>
            New community
          </h3>
          <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
            Give your community a clear title and description.
          </p>
        </div>

        <Input
          value={newCommunityTitle}
          onChange={(e) => setNewCommunityTitle(e.target.value)}
          placeholder="e.g., Menstrual Health Basics"
        />

        <Textarea
          value={newCommunityDescription}
          onChange={(e) => setNewCommunityDescription(e.target.value)}
          placeholder="e.g., Ask questions, share experiences, learn the basics."
        />

        <div className="flex gap-2">
          <Button
            className="flex-1 text-white"
            style={{ backgroundColor: "#A592AB" }}
            onClick={createCommunity}
          >
            Create
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => {
              setCreatingCommunity(false);
              setNewCommunityTitle("");
              setNewCommunityDescription("");
              setNewCommunityIcon("💬");
            }}
          >
            Cancel
          </Button>
        </div>
      </Card>
    )}

    
    {/* Forum Categories (Coming soon) */}
<Card className="p-4 bg-white">
  <h3 className="font-semibold" style={{ color: "#594F62" }}>
    Community Forums
  </h3>
  <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
    Coming soon — you’ll be able to join communities and chat with others.
  </p>
</Card>

{categories.map((cat) => (
  <Card
    key={cat.id}
    className="p-4 bg-white opacity-60 cursor-not-allowed"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="text-2xl">{cat.icon}</div>

      <div className="flex-1">
        <h3 className="font-semibold" style={{ color: "#594F62" }}>
          {cat.title}
        </h3>
        <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
          {cat.description}
        </p>

        <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs"
             style={{ backgroundColor: "#F4F0FF", color: "#776B7D" }}>
          Coming soon
        </div>
      </div>

      <ChevronRight className="w-5 h-5 mt-1" style={{ color: "#9A92AB" }} />
    </div>
  </Card>
))}

            {/* JOIN BUTTON (browse allowed; joining optional) */}
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant={isMember(cat.id) ? "outline" : "default"}
                className={isMember(cat.id) ? "" : "text-white"}
                style={isMember(cat.id) ? {} : { backgroundColor: "#A592AB" }}
                onClick={(e) => {
                  e.stopPropagation(); // prevents opening category when tapping Join
                  isMember(cat.id) ? leaveCommunity(cat.id) : joinCommunity(cat.id);
                }}
              >
                {isMember(cat.id) ? "Joined" : "Join"}
              </Button>

              <div className="flex items-center text-xs" style={{ color: "#9A92AB" }}>
                {cat.membersCount ?? 0} members
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 mt-1" style={{ color: "#9A92AB" }} />
        </div>
      </Card>
    ))}
  </div>
)}

        {/* VIEW 2: Threads list inside a category */}
        {selectedCategoryId && !selectedThreadId && (
          <div className="space-y-3">
            {/* Create thread button */}
           {!creatingThread && (
  isMember(selectedCategoryId) ? (
    <Button
      className="w-full text-white"
      style={{ backgroundColor: "#A592AB" }}
      onClick={() => setCreatingThread(true)}
    >
      <MessageCirclePlus className="w-4 h-4 mr-2" />
      Start a new discussion
    </Button>
  ) : (
    <Card className="p-4 bg-white">
      <p className="text-sm font-semibold" style={{ color: "#594F62" }}>
        Join to start a discussion
      </p>
      <p className="text-xs mt-1" style={{ color: "#776B7D" }}>
        You can browse topics, but you need to join this community to post.
      </p>
    </Card>
  )
)}


            {/* Create thread form */}
            {creatingThread && (
              <Card className="p-4 bg-white space-y-3">
                <div>
                  <h3 className="font-semibold" style={{ color: "#594F62" }}>
                    New discussion
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "#776B7D" }}>
                    Give your discussion a clear title.
                  </p>
                </div>

                <Input
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  placeholder="e.g., How do you track your cycle?"
                />

                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-white"
                    style={{ backgroundColor: "#A592AB" }}
                    onClick={createThread}
                  >
                    Create
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      setCreatingThread(false);
                      setNewThreadTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Thread cards */}
            {threadsInCategory.map((t) => (
              <Card
                key={t.id}
                className="p-4 bg-white cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedThreadId(t.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: "#594F62" }}>
                      {t.title}
                    </h3>
                    <p className="text-xs mt-2" style={{ color: "#9A92AB" }}>
                      Started by {t.createdBy} • {t.createdAt}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 mt-1" style={{ color: "#9A92AB" }} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* VIEW 3: Thread detail (posts) */}
        {selectedThreadId && selectedThread && (
          <div className="space-y-3">
            {/* Posts */}
            {postsInThread.map((p) => (
              <Card key={p.id} className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#594F62" }}>
                      {p.author}
                    </p>
                    <p className="text-xs" style={{ color: "#9A92AB" }}>
                      {p.createdAt}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => likePost(p.id)}
                    className="flex items-center gap-1 text-sm"
                    style={{ color: "#A592AB" }}
                    aria-label="Like post"
                  >
                    <Heart className="w-4 h-4" />
                    {p.likes}
                  </button>
                </div>

                <p className="text-sm mt-3 leading-relaxed" style={{ color: "#594F62" }}>
                  {p.content}
                </p>
              </Card>
            ))}

            {/* Add post */}
            {threadCategoryId && isMember(threadCategoryId) ? (
            <Card className="p-4 bg-white space-y-3">
              <p className="text-sm font-semibold" style={{ color: "#594F62" }}>
                Add a reply
              </p>
              <Input
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Write your message…"
              />
              <Button
                className="w-full text-white"
                style={{ backgroundColor: "#A592AB" }}
                onClick={addPost}
              >
                Post reply
              </Button>

              <p className="text-xs" style={{ color: "#9A92AB" }}>
                Reminder: be kind. If you feel unsafe or have severe symptoms, please seek medical help.
              </p>
            </Card>

) : (
  <Card className="p-4 bg-white">
    <p className="text-sm font-semibold" style={{ color: "#594F62" }}>
      Join to reply
    </p>
    <p className="text-xs mt-1" style={{ color: "#776B7D" }}>
      You can browse posts, but you need to join this community to participate.
    </p>
  </Card>
)}

          </div>
        )}
      </div>
    </div>
  );
}
