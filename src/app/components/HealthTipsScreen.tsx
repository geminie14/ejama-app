import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Search, Bookmark, BookmarkCheck, Share2, X } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";
import { projectId } from "@/utils/supabase/info";

interface HealthTipsScreenProps {
  onBack: () => void;
  accessToken: string;
}

interface Article {
  id: string;
  title: string;
  readTime: string;
  content: string[];
}

interface Topic {
  title: string;
  description: string;
  icon: string;
  articles: Article[];
}

export function HealthTipsScreen({ onBack, accessToken }: HealthTipsScreenProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  useEffect(() => {
    loadBookmarksAndProgress();
  }, []);

  useEffect(() => {
    if (selectedArticle) {
      const timer = setTimeout(() => {
        saveReadingProgress(selectedArticle.id, 50);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedArticle]);

  const loadBookmarksAndProgress = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/health-tips/user-data`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBookmarkedArticles(data.bookmarks || []);
        setReadingProgress(data.progress || {});
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const toggleBookmark = async (articleId: string) => {
    const isBookmarked = bookmarkedArticles.includes(articleId);
    const newBookmarks = isBookmarked
      ? bookmarkedArticles.filter(id => id !== articleId)
      : [...bookmarkedArticles, articleId];

    setBookmarkedArticles(newBookmarks);

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/health-tips/bookmark`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ articleId, bookmarked: !isBookmarked }),
        }
      );
      
      toast.success(isBookmarked ? "Bookmark removed" : "Article bookmarked");
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setBookmarkedArticles(bookmarkedArticles);
    }
  };

  const saveReadingProgress = async (articleId: string, progress: number) => {
    setReadingProgress(prev => ({ ...prev, [articleId]: progress }));

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/health-tips/progress`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ articleId, progress }),
        }
      );
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleShareWhatsApp = () => {
    if (selectedArticle && selectedTopic) {
      const text = encodeURIComponent(
        `Check out this health tip: "${selectedArticle.title}" from Ejama`
      );
      const url = `https://wa.me/?text=${text}`;
      window.open(url, "_blank");
      setShowShareMenu(false);
    }
  };

  const handleShareTwitter = () => {
    if (selectedArticle && selectedTopic) {
      const text = encodeURIComponent(`"${selectedArticle.title}" - Ejama Health Tips`);
      const url = `https://twitter.com/intent/tweet?text=${text}`;
      window.open(url, "_blank");
      setShowShareMenu(false);
    }
  };

  const handleShareFacebook = () => {
    if (selectedArticle && selectedTopic) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(url, "_blank");
      setShowShareMenu(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
    setShowShareMenu(false);
  };

  const topics: Topic[] = [
    {
      title: "Nutrition & Hydration",
      description: "Food choices that support energy, mood, and comfort.",
      icon: "🥗",
      articles: [
        {
          id: "nh-1",
          title: "What to Eat Before & During Your Period",
          readTime: "4 min read",
          content: [
            "Food can help reduce bloating, fatigue, and mood swings during your cycle.",
            "",
            "Helpful choices:",
            "• Iron-rich foods (beans, leafy greens, beef, fish)",
            "• Vitamin C (oranges, pineapple, peppers) to support iron absorption",
            "• Whole grains for steady energy",
            "• Omega-3 sources (fish, chia, flax) for inflammation support",
            "",
            "Try to limit:",
            "• Excess salt (can worsen bloating)",
            "• Too much caffeine (can increase anxiety and breast tenderness)",
            "• Very sugary snacks (energy crash)",
          ],
        },
        {
          id: "nh-2",
          title: "Hydration Tips for Less Bloating",
          readTime: "3 min read",
          content: [
            "Drinking enough water can actually reduce water retention.",
            "",
            "Simple tips:",
            "• Aim for small sips throughout the day",
            "• Add lemon/cucumber if that helps you drink more",
            "• Try warm herbal teas (ginger, peppermint, chamomile)",
            "• Reduce salty snacks and instant noodles",
          ],
        },
      ],
    },
    {
      title: "Movement & Exercise",
      description: "Gentle activity that can reduce cramps and stress.",
      icon: "🏃🏽‍♀️",
      articles: [
        {
          id: "mv-1",
          title: "Best Exercises for Cramps",
          readTime: "3 min read",
          content: [
            "Light movement increases blood flow and can reduce cramping.",
            "",
            "Try:",
            "• Walking (10–20 minutes)",
            "• Gentle stretching (hips, lower back)",
            "• Yoga poses like child's pose and cat-cow",
            "",
            "Tip: If pain is severe, go easy — comfort first.",
          ],
        },
        {
          id: "mv-2",
          title: "When to Rest Instead",
          readTime: "2 min read",
          content: [
            "Rest is also a form of self-care, especially if symptoms are strong.",
            "",
            "Choose rest when you have:",
            "• Dizziness or extreme fatigue",
            "• Very heavy bleeding",
            "• Pain that limits normal movement",
            "",
            "If symptoms are unusual for you, consider speaking with a healthcare provider.",
          ],
        },
      ],
    },
    {
      title: "Sleep & Stress",
      description: "Better rest supports mood, pain tolerance, and focus.",
      icon: "😴",
      articles: [
        {
          id: "ss-1",
          title: "Sleep Routine for Better Period Days",
          readTime: "4 min read",
          content: [
            "Hormone changes can affect sleep. A simple routine can help.",
            "",
            "Try:",
            "• Keep the same sleep/wake time (even weekends)",
            "• Reduce screen time 30–60 minutes before bed",
            "• Warm bath or light stretching at night",
            "• A calm drink like chamomile tea",
          ],
        },
        {
          id: "ss-2",
          title: "Stress Relief That Actually Works",
          readTime: "3 min read",
          content: [
            "Stress can worsen cramps and mood swings.",
            "",
            "Helpful options:",
            "• Box breathing (4-4-4-4)",
            "• Journaling for 5 minutes",
            "• Short walk outside",
            "• Talking to someone you trust",
            "",
            "Start small. Consistency beats intensity.",
          ],
        },
      ],
    },
  ];

  const allArticles = topics.flatMap(topic => 
    topic.articles.map(article => ({ ...article, topic }))
  );

  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBookmark = !showBookmarksOnly || bookmarkedArticles.includes(article.id);
    
    return matchesSearch && matchesBookmark;
  });

  const continueReadingArticles = allArticles.filter(article => {
    const progress = readingProgress[article.id] || 0;
    return progress > 0 && progress < 100;
  });

  const handleBackClick = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
      return;
    }
    if (selectedTopic) {
      setSelectedTopic(null);
      return;
    }
    onBack();
  };

  // Article detail view
  if (selectedArticle && selectedTopic) {
    const isBookmarked = bookmarkedArticles.includes(selectedArticle.id);

    return (
      <div className="min-h-screen bg-[#E7DDFF] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedArticle(null)}
              style={{ color: '#A592AB' }}
              className="hover:bg-[#D4C4EC]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {selectedTopic.title}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => toggleBookmark(selectedArticle.id)}
                style={{ color: '#A592AB' }}
                className="hover:bg-[#D4C4EC]"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowShareMenu(!showShareMenu)}
                style={{ color: '#A592AB' }}
                className="hover:bg-[#D4C4EC]"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {showShareMenu && (
            <Card className="mb-6 p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: '#594F62' }}>Share Article</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleShareWhatsApp}
                  className="w-full"
                  style={{ backgroundColor: '#25D366', color: 'white' }}
                >
                  WhatsApp
                </Button>
                <Button
                  onClick={handleShareFacebook}
                  className="w-full"
                  style={{ backgroundColor: '#1877F2', color: 'white' }}
                >
                  Facebook
                </Button>
                <Button
                  onClick={handleShareTwitter}
                  className="w-full"
                  style={{ backgroundColor: '#1DA1F2', color: 'white' }}
                >
                  Twitter
                </Button>
                <Button
                  onClick={handleCopyLink}
                  className="w-full"
                  style={{ backgroundColor: '#A592AB', color: 'white' }}
                >
                  Copy Link
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-8 bg-white">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedTopic.icon}</span>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: '#776B7D' }}>{selectedTopic.title}</p>
                  <h1 className="text-3xl font-bold" style={{ color: '#594F62' }}>
                    {selectedArticle.title}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#776B7D' }}>
                <span>📖</span>
                <span>{selectedArticle.readTime}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {selectedArticle.content.map((paragraph, index) => (
                <p 
                  key={index} 
                  className={`mb-4 ${paragraph === '' ? 'mb-2' : ''}`}
                  style={{ color: '#594F62', lineHeight: '1.8' }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Articles list for selected topic
  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-[#E7DDFF] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedTopic(null)}
              style={{ color: '#A592AB' }}
              className="hover:bg-[#D4C4EC]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{selectedTopic.icon}</span>
              <h1 className="text-3xl font-bold" style={{ color: '#594F62' }}>
                {selectedTopic.title}
              </h1>
            </div>
            <p style={{ color: '#776B7D' }}>{selectedTopic.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedTopic.articles.map((article) => {
              const isBookmarked = bookmarkedArticles.includes(article.id);
              const progress = readingProgress[article.id] || 0;

              return (
                <Card
                  key={article.id}
                  className="p-6 bg-white hover:shadow-lg transition-shadow"
                  style={{ borderLeft: '4px solid #A592AB' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedArticle(article)}>
                      <h3 className="text-xl font-semibold mb-2" style={{ color: '#594F62' }}>
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm mb-3" style={{ color: '#776B7D' }}>
                        <span>📖</span>
                        <span>{article.readTime}</span>
                      </div>
                      <p className="text-sm line-clamp-2" style={{ color: '#776B7D' }}>
                        {article.content[0]}
                      </p>
                      
                      {progress > 0 && progress < 100 && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${progress}%`, backgroundColor: '#A592AB' }}
                            />
                          </div>
                          <p className="text-xs mt-1" style={{ color: '#A592AB' }}>
                            Continue reading
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(article.id)}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-5 h-5" style={{ color: '#A592AB' }} />
                        ) : (
                          <Bookmark className="w-5 h-5" style={{ color: '#776B7D' }} />
                        )}
                      </Button>
                      <ChevronRight 
                        className="w-5 h-5 cursor-pointer" 
                        style={{ color: '#A592AB' }}
                        onClick={() => setSelectedArticle(article)}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Main topics list with search
  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            style={{ color: '#A592AB' }}
            className="hover:bg-[#D4C4EC]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#594F62' }}>Health Tips</h1>
          <p style={{ color: '#776B7D' }}>Practical tips to support your wellbeing</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#A592AB' }} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search health tips..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={showBookmarksOnly ? "default" : "outline"}
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              style={showBookmarksOnly ? { backgroundColor: '#A592AB', color: 'white' } : { borderColor: '#A592AB', color: '#A592AB' }}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmarked ({bookmarkedArticles.length})
            </Button>
          </div>
        </div>

        {/* Continue Reading Section */}
        {continueReadingArticles.length > 0 && !searchQuery && !showBookmarksOnly && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#594F62' }}>Continue Reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {continueReadingArticles.map((article) => {
                const progress = readingProgress[article.id] || 0;
                return (
                  <Card
                    key={article.id}
                    className="p-6 bg-white cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ borderLeft: '4px solid #BCA4E3' }}
                    onClick={() => {
                      setSelectedTopic(article.topic);
                      setSelectedArticle(article);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs mb-1" style={{ color: '#776B7D' }}>{article.topic.icon} {article.topic.title}</p>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#594F62' }}>
                          {article.title}
                        </h3>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: '#BCA4E3' }}
                          />
                        </div>
                        <p className="text-xs" style={{ color: '#776B7D' }}>{progress}% complete</p>
                      </div>
                      <ChevronRight className="w-5 h-5 ml-4 flex-shrink-0" style={{ color: '#BCA4E3' }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Results or Topics */}
        {searchQuery || showBookmarksOnly ? (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#594F62' }}>
              {showBookmarksOnly ? 'Bookmarked Tips' : 'Search Results'} ({filteredArticles.length})
            </h2>
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => {
                  const isBookmarked = bookmarkedArticles.includes(article.id);
                  const progress = readingProgress[article.id] || 0;

                  return (
                    <Card
                      key={article.id}
                      className="p-6 bg-white hover:shadow-lg transition-shadow"
                      style={{ borderLeft: '4px solid #A592AB' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => {
                          setSelectedTopic(article.topic);
                          setSelectedArticle(article);
                        }}>
                          <p className="text-xs mb-1" style={{ color: '#776B7D' }}>{article.topic.icon} {article.topic.title}</p>
                          <h3 className="text-lg font-semibold mb-2" style={{ color: '#594F62' }}>
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: '#776B7D' }}>
                            <span>📖</span>
                            <span>{article.readTime}</span>
                          </div>
                          <p className="text-sm line-clamp-2" style={{ color: '#776B7D' }}>
                            {article.content[0]}
                          </p>

                          {progress > 0 && progress < 100 && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%`, backgroundColor: '#A592AB' }}
                                />
                              </div>
                              <p className="text-xs mt-1" style={{ color: '#A592AB' }}>
                                Continue reading
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(article.id)}
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-5 h-5" style={{ color: '#A592AB' }} />
                            ) : (
                              <Bookmark className="w-5 h-5" style={{ color: '#776B7D' }} />
                            )}
                          </Button>
                          <ChevronRight 
                            className="w-5 h-5 cursor-pointer" 
                            style={{ color: '#A592AB' }}
                            onClick={() => {
                              setSelectedTopic(article.topic);
                              setSelectedArticle(article);
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 bg-white text-center">
                <p style={{ color: '#776B7D' }}>No tips found. Try adjusting your search or filters.</p>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic, index) => (
              <Card
                key={index}
                className="p-6 bg-white cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl">{topic.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2" style={{ color: '#594F62' }}>
                        {topic.title}
                      </h3>
                      <p className="mb-3" style={{ color: '#776B7D' }}>
                        {topic.description}
                      </p>
                      <p className="text-sm font-medium" style={{ color: '#A592AB' }}>
                        {topic.articles.length} article{topic.articles.length > 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 flex-shrink-0" style={{ color: '#A592AB' }} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
