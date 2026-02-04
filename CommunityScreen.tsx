import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Heart, MessageCirclePlus, Plus, Users, UserPlus, UserMinus } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";
import { projectId } from "/utils/supabase/info";

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
    
    if (response.ok) {
  const data = await response.json();

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

       {/* VIEW 1: Categories */}
{!selectedCategoryId && !selectedThreadId && (
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

    
    {categories.map((cat) => (
      <Card
        key={cat.id}
        className="p-4 bg-white cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedCategoryId(cat.id)}
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

            <p className="text-xs mt-2" style={{ color: "#9A92AB" }}>
              {threads.filter((t) => t.categoryId === cat.id).length} threads
            </p>

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
            {isMember(selectedCategoryId) ? (
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