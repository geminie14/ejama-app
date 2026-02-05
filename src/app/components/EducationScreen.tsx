import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Search, Bookmark, BookmarkCheck, Share2, X } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";
import { projectId } from "/utils/supabase/info";

interface EducationScreenProps {
  onBack: () => void;
  accessToken: string;
}

interface Article {
  id: string;
  title: string;
  content: string[];
  readTime: string;
}

interface Topic {
  title: string;
  description: string;
  icon: string;
  articles: Article[];
}

export function EducationScreen({ onBack, accessToken }: EducationScreenProps) {
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
      // Mark as reading and update progress
      const timer = setTimeout(() => {
        saveReadingProgress(selectedArticle.id, 50);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [selectedArticle]);

  const loadBookmarksAndProgress = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/education/user-data`,
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
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/education/bookmark`,
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
        `https://${projectId}.supabase.co/functions/v1/make-server-1aee76a8/education/progress`,
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
        `Check out this article: "${selectedArticle.title}" from Ejama Education`
      );
      const url = `https://wa.me/?text=${text}`;
      window.open(url, "_blank");
      setShowShareMenu(false);
    }
  };

  const handleShareTwitter = () => {
    if (selectedArticle && selectedTopic) {
      const text = encodeURIComponent(`"${selectedArticle.title}" - Ejama Education`);
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
      title: "Menstrual Health Basics",
      description: "Understanding your menstrual cycle, what's normal, and when to seek help",
      icon: "📚",
      articles: [
        {
          id: "mhb-1",
          title: "Understanding Your Menstrual Cycle",
          readTime: "5 min read",
          content: [
            "The menstrual cycle is a natural process that prepares your body for pregnancy each month. It's controlled by hormones and typically lasts between 21 to 35 days, though the average is 28 days.",
            "Your cycle has four main phases:",
            "1. Menstruation (Days 1-5): This is when you have your period. The uterine lining sheds, causing bleeding that typically lasts 2-7 days.",
            "2. Follicular Phase (Days 1-13): Your body prepares to release an egg. Estrogen levels rise, helping the uterine lining to rebuild.",
            "3. Ovulation (Day 14): An egg is released from one of your ovaries. This is when you're most fertile.",
            "4. Luteal Phase (Days 15-28): After ovulation, your body prepares for a possible pregnancy. If the egg isn't fertilized, hormone levels drop and your period begins.",
            "Understanding these phases helps you know what to expect and track any irregularities. Remember, every body is different, and your cycle may vary slightly from month to month."
          ]
        },
        {
          id: "mhb-2",
          title: "What's Normal and When to Seek Help",
          readTime: "4 min read",
          content: [
            "While menstrual experiences vary, here's what's generally considered normal:",
            "• Cycle length: 21-35 days between periods",
            "• Period duration: 2-7 days of bleeding",
            "• Flow: Light to heavy (changing a pad/tampon every 4-6 hours)",
            "• Mild cramping and discomfort",
            "• Mood changes before and during your period",
            "",
            "When to see a healthcare provider:",
            "• Periods lasting longer than 7 days",
            "• Very heavy bleeding (soaking through pads every 1-2 hours)",
            "• Severe pain that interferes with daily activities",
            "• Irregular cycles (constantly varying by more than 7 days)",
            "• Missing periods (not due to pregnancy)",
            "• Bleeding between periods",
            "• Sudden changes in your normal pattern",
            "",
            "Don't hesitate to seek help if something doesn't feel right. Your menstrual health is an important indicator of your overall health."
          ]
        },
        {
          id: "mhb-3",
          title: "Tracking Your Period",
          readTime: "3 min read",
          content: [
            "Tracking your menstrual cycle is one of the best ways to understand your body and identify any patterns or irregularities.",
            "",
            "What to track:",
            "• Start date of each period",
            "• Duration of bleeding",
            "• Flow intensity (light, medium, heavy)",
            "• Physical symptoms (cramps, headaches, bloating)",
            "• Emotional changes (mood swings, irritability)",
            "• Energy levels",
            "",
            "Benefits of tracking:",
            "• Predict when your next period will start",
            "• Identify your fertile window",
            "• Notice patterns in symptoms",
            "• Detect irregularities early",
            "• Provide accurate information to healthcare providers",
            "",
            "You can track using the Ejama Period Tracker feature, a calendar, or a notebook. The key is consistency—track every cycle to get the most accurate picture of your patterns."
          ]
        }
      ]
    },
    {
      title: "Hygiene Practices",
      description: "Best practices for staying clean and healthy during your period",
      icon: "🧼",
      articles: [
        {
          id: "hp-1",
          title: "Choosing the Right Menstrual Products",
          readTime: "4 min read",
          content: [
            "There are several types of menstrual products available, each with its own benefits. The best choice depends on your lifestyle, comfort level, and flow.",
            "",
            "Pads (Sanitary Napkins):",
            "• Disposable or reusable cloth pads",
            "• Easy to use, especially for beginners",
            "• Available in different sizes for varying flow levels",
            "• Should be changed every 4-6 hours",
            "",
            "Tampons:",
            "• Inserted into the vagina to absorb blood",
            "• Good for swimming and physical activities",
            "• Must be changed every 4-8 hours to prevent infection",
            "• Available in different absorbency levels",
            "",
            "Menstrual Cups:",
            "• Reusable silicone cups that collect blood",
            "• Eco-friendly and cost-effective long-term",
            "• Can be worn for up to 12 hours",
            "• Requires proper cleaning between uses",
            "",
            "Period Underwear:",
            "• Reusable underwear with built-in absorbent layers",
            "• Good for light days or as backup protection",
            "• Washable and eco-friendly",
            "",
            "Choose what feels comfortable and suits your needs. Many women use different products at different times in their cycle or for different activities."
          ]
        },
        {
          id: "hp-2",
          title: "Proper Hygiene During Your Period",
          readTime: "3 min read",
          content: [
            "Maintaining good hygiene during your period helps prevent infections and keeps you feeling fresh and confident.",
            "",
            "Essential hygiene practices:",
            "• Wash your hands before and after changing menstrual products",
            "• Change pads or tampons every 4-6 hours, even if flow is light",
            "• Bathe or shower daily, washing the external genital area gently",
            "• Use mild, unscented soap and water—avoid douching",
            "• Wipe from front to back after using the toilet",
            "• Wear clean, breathable cotton underwear",
            "• Change underwear daily",
            "",
            "Product disposal:",
            "• Wrap used pads/tampons in toilet paper or the wrapper",
            "• Dispose in a waste bin, never flush down the toilet",
            "• For reusable products, rinse in cold water before washing",
            "",
            "Avoid:",
            "• Scented products or perfumes in the genital area",
            "• Wearing the same pad/tampon for too long",
            "• Using products with harsh chemicals",
            "• Sharing menstrual products with others",
            "",
            "Good hygiene is simple but important for your health and comfort during menstruation."
          ]
        },
        {
          id: "hp-3",
          title: "Preventing Infections",
          readTime: "3 min read",
          content: [
            "While menstruation itself is healthy and natural, certain practices can help prevent infections during your period.",
            "",
            "Toxic Shock Syndrome (TSS) prevention:",
            "• Use the lowest absorbency tampon needed for your flow",
            "• Change tampons every 4-6 hours",
            "• Never leave a tampon in for more than 8 hours",
            "• Consider alternating between tampons and pads",
            "• Know the symptoms: sudden high fever, vomiting, diarrhea, dizziness, rash",
            "",
            "Yeast and bacterial infections:",
            "• Keep the genital area clean and dry",
            "• Avoid tight-fitting clothes during your period",
            "• Change wet swimsuits or workout clothes promptly",
            "• Don't use scented products",
            "• Change menstrual products regularly",
            "",
            "Signs of infection to watch for:",
            "• Unusual odor",
            "• Abnormal discharge",
            "• Itching or burning",
            "• Pain or discomfort",
            "• Fever",
            "",
            "If you experience any of these symptoms, consult a healthcare provider. Most infections are easily treatable when caught early."
          ]
        }
      ]
    },
    {
      title: "Myth Busters",
      description: "Separating facts from fiction about menstruation",
      icon: "❌",
      articles: [
        {
          id: "mb-1",
          title: "Common Myths About Exercise and Periods",
          readTime: "3 min read",
          content: [
            "MYTH: You can't or shouldn't exercise during your period",
            "FACT: Exercise is not only safe during menstruation, but it can actually help reduce period symptoms!",
            "",
            "Benefits of exercising during your period:",
            "• Reduces menstrual cramps through the release of endorphins",
            "• Improves mood and reduces stress",
            "• Decreases bloating",
            "• Boosts energy levels",
            "• Helps with better sleep",
            "",
            "Best exercises during your period:",
            "• Light cardio like walking or swimming",
            "• Yoga and stretching",
            "• Low-impact activities",
            "• Whatever feels comfortable for you!",
            "",
            "It's okay to modify your workout intensity based on how you feel. If you're experiencing heavy flow or severe cramps, lighter activities might be more comfortable. Listen to your body and do what feels right for you.",
            "",
            "Remember: Your period doesn't have to stop you from being active. Many professional athletes compete during menstruation without any issues."
          ]
        },
        {
          id: "mb-2",
          title: "Breaking Stigma: Periods Are Not Dirty",
          readTime: "4 min read",
          content: [
            "MYTH: Periods are dirty, impure, or shameful",
            "FACT: Menstruation is a completely natural, healthy biological process",
            "",
            "Understanding the truth:",
            "Menstrual blood is not dirty or toxic. It's simply the shedding of the uterine lining, which consists of blood, tissue, and nutrients that would have supported a pregnancy.",
            "",
            "Why this myth is harmful:",
            "• Creates shame and embarrassment around natural bodily functions",
            "• Prevents open conversations about menstrual health",
            "• Can lead to poor menstrual hygiene due to lack of education",
            "• Causes girls to miss school or avoid social activities",
            "• Reinforces gender inequality",
            "",
            "The reality:",
            "• Approximately half the world's population menstruates",
            "• Periods are a sign of reproductive health",
            "• Menstruation has been stigmatized by cultural taboos, not science",
            "• Speaking openly about periods helps break down barriers",
            "",
            "What you can do:",
            "• Talk about periods openly and without shame",
            "• Educate others with facts",
            "• Support menstrual health initiatives",
            "• Challenge stigmatizing language and attitudes",
            "",
            "Periods are as natural as breathing. There's no shame in a healthy body doing what it's designed to do."
          ]
        },
        {
          id: "mb-3",
          title: "Swimming, Bathing, and Other Activities",
          readTime: "3 min read",
          content: [
            "MYTH: You can't swim, bathe, or participate in water activities during your period",
            "FACT: You can safely enjoy water activities during menstruation with proper menstrual products",
            "",
            "Swimming during your period:",
            "• Completely safe with tampons or menstrual cups",
            "• Water pressure may temporarily reduce flow while swimming",
            "• Use a fresh tampon or empty your cup before swimming",
            "• Change immediately after swimming",
            "",
            "Bathing and showering:",
            "• Not only safe, but recommended for good hygiene",
            "• Warm baths can actually help relieve cramps",
            "• There's no risk of infection from bathing during your period",
            "• Clean your body as you normally would",
            "",
            "Other myths about activities:",
            "",
            "MYTH: You can't cook or touch food during your period",
            "FACT: Menstruation has no effect on food or cooking. This is a cultural myth with no scientific basis.",
            "",
            "MYTH: You can't wash your hair during your period",
            "FACT: There's no medical reason to avoid hair washing. Personal hygiene is important regardless of your cycle.",
            "",
            "MYTH: You shouldn't have sex during your period",
            "FACT: This is a personal choice. It's safe if both partners are comfortable, though pregnancy and STI protection are still needed.",
            "",
            "Don't let myths limit your life. With proper preparation, you can do anything during your period that you do at any other time."
          ]
        },
        {
          id: "mb-4",
          title: "PMS: Real Science, Not 'In Your Head'",
          readTime: "4 min read",
          content: [
            "MYTH: PMS is just an excuse or 'all in your head'",
            "FACT: Premenstrual Syndrome (PMS) is a real medical condition caused by hormonal changes",
            "",
            "The science behind PMS:",
            "During the luteal phase of your cycle (after ovulation), levels of estrogen and progesterone rise and then drop before your period. These hormonal fluctuations affect neurotransmitters in the brain, including serotonin, which influences mood, appetite, and sleep.",
            "",
            "Common PMS symptoms:",
            "Physical:",
            "• Bloating and weight gain",
            "• Breast tenderness",
            "• Headaches",
            "• Fatigue",
            "• Digestive changes",
            "",
            "Emotional/Behavioral:",
            "• Mood swings",
            "• Irritability",
            "• Anxiety or depression",
            "• Difficulty concentrating",
            "• Changes in sleep patterns",
            "• Food cravings",
            "",
            "PMS affects up to 75% of menstruating women to varying degrees.",
            "",
            "Managing PMS:",
            "• Regular exercise",
            "• Balanced diet with complex carbohydrates",
            "• Adequate sleep",
            "• Stress management",
            "• Reducing caffeine and salt",
            "• Supplements (calcium, magnesium, vitamin B6)",
            "• Medical treatment for severe cases",
            "",
            "If PMS severely impacts your daily life, talk to a healthcare provider. You deserve to feel your best throughout your entire cycle."
          ]
        }
      ]
    },
    {
      title: "Managing Pain and Discomfort",
      description: "Natural and medical ways to ease period symptoms",
      icon: "💆‍♀️",
      articles: [
        {
          id: "mpd-1",
          title: "Understanding Period Pain",
          readTime: "4 min read",
          content: [
            "Period pain, medically known as dysmenorrhea, is one of the most common menstrual symptoms. Understanding why it happens can help you manage it better.",
            "",
            "What causes period cramps?",
            "During menstruation, your uterus contracts to help shed its lining. These contractions are triggered by hormone-like substances called prostaglandins. Higher levels of prostaglandins are associated with more severe cramps.",
            "",
            "Types of period pain:",
            "",
            "Primary dysmenorrhea:",
            "• Common menstrual cramps with no underlying condition",
            "• Usually starts 1-2 days before or with your period",
            "• Typically improves within 2-3 days",
            "• Often lessens with age or after childbirth",
            "",
            "Secondary dysmenorrhea:",
            "• Pain caused by an underlying reproductive health condition",
            "• May include endometriosis, fibroids, or pelvic inflammatory disease",
            "• Often starts earlier in the cycle and lasts longer",
            "• May worsen over time",
            "",
            "Where pain occurs:",
            "• Lower abdomen and pelvis",
            "• Lower back",
            "• Thighs",
            "",
            "When to see a doctor:",
            "• Pain that doesn't improve with over-the-counter medication",
            "• Symptoms that interfere with daily activities",
            "• Pain that worsens over time",
            "• New symptoms after age 25",
            "",
            "Remember: While some discomfort is normal, severe pain is not. Don't hesitate to seek medical advice."
          ]
        },
        {
          id: "mpd-2",
          title: "Natural Remedies for Period Relief",
          readTime: "5 min read",
          content: [
            "Many natural methods can help ease period discomfort. Try different approaches to find what works best for you.",
            "",
            "Heat therapy:",
            "• Apply a heating pad or hot water bottle to your lower abdomen",
            "• Take a warm bath",
            "• Heat improves blood flow and relaxes cramping muscles",
            "• Use for 15-20 minutes at a time",
            "",
            "Exercise and movement:",
            "• Light cardio increases endorphins (natural pain relievers)",
            "• Yoga poses like child's pose or cat-cow can help",
            "• Walking or gentle stretching",
            "• Even 10-15 minutes can make a difference",
            "",
            "Dietary changes:",
            "• Stay well hydrated with water and herbal teas",
            "• Eat anti-inflammatory foods (fruits, vegetables, fish)",
            "• Reduce salt to minimize bloating",
            "• Limit caffeine and alcohol",
            "• Try ginger or chamomile tea",
            "",
            "Massage:",
            "• Gently massage your lower abdomen in circular motions",
            "• Use essential oils like lavender or peppermint (diluted)",
            "• Focus on the lower back and abdomen",
            "",
            "Rest and relaxation:",
            "• Get adequate sleep (7-9 hours)",
            "• Practice deep breathing exercises",
            "• Meditation or mindfulness",
            "• Reduce stress when possible",
            "",
            "Supplements that may help:",
            "• Magnesium",
            "• Omega-3 fatty acids",
            "• Vitamin B1 and B6",
            "• Vitamin D",
            "",
            "Note: Consult a healthcare provider before starting new supplements, especially if you take other medications."
          ]
        },
        {
          id: "mpd-3",
          title: "Medical Treatments for Period Pain",
          readTime: "4 min read",
          content: [
            "When natural remedies aren't enough, medical treatments can provide relief. Always consult with a healthcare provider before starting any medication.",
            "",
            "Over-the-counter (OTC) pain relievers:",
            "",
            "Nonsteroidal anti-inflammatory drugs (NSAIDs):",
            "• Ibuprofen (Advil, Motrin)",
            "• Naproxen (Aleve)",
            "• Work by reducing prostaglandin production",
            "• Most effective when taken at the first sign of pain",
            "• Follow package directions for dosing",
            "",
            "Acetaminophen (Paracetamol):",
            "• Can help with pain but doesn't reduce inflammation",
            "• Good alternative if you can't take NSAIDs",
            "",
            "Hormonal treatments:",
            "",
            "Birth control pills:",
            "• Regulate or eliminate periods",
            "• Reduce prostaglandin production",
            "• Make periods lighter and less painful",
            "• Require prescription",
            "",
            "Hormonal IUD:",
            "• Can significantly reduce or eliminate periods",
            "• Long-term solution (3-7 years depending on type)",
            "",
            "Other hormonal options:",
            "• Contraceptive patch",
            "• Vaginal ring",
            "• Hormonal implant",
            "",
            "Prescription medications:",
            "• Stronger NSAIDs for severe pain",
            "• Muscle relaxants in some cases",
            "• Treatment for underlying conditions if diagnosed",
            "",
            "When to seek medical help:",
            "• OTC medications don't provide relief",
            "• Pain interferes with work, school, or daily life",
            "• Heavy bleeding (soaking through protection every 1-2 hours)",
            "• Symptoms suggest an underlying condition",
            "",
            "Remember: Severe period pain is not something you have to endure. Effective treatments are available."
          ]
        },
        {
          id: "mpd-4",
          title: "Managing Other Period Symptoms",
          readTime: "4 min read",
          content: [
            "Beyond cramps, many women experience other uncomfortable symptoms during menstruation. Here's how to manage them.",
            "",
            "Bloating and water retention:",
            "• Reduce salt intake",
            "• Drink plenty of water (counterintuitively, this helps)",
            "• Eat potassium-rich foods (bananas, avocados)",
            "• Avoid carbonated drinks",
            "• Light exercise to improve circulation",
            "• Diuretics (water pills) if prescribed by a doctor",
            "",
            "Headaches and migraines:",
            "• Stay hydrated",
            "• Maintain regular sleep schedule",
            "• OTC pain relievers early when headache starts",
            "• Cold or warm compress on head/neck",
            "• Limit triggers (bright lights, loud sounds)",
            "• Prescription medication for menstrual migraines",
            "",
            "Digestive issues (diarrhea, constipation):",
            "• Eat fiber-rich foods",
            "• Stay hydrated",
            "• Avoid trigger foods",
            "• Gentle movement and exercise",
            "• OTC remedies if needed (antidiarrheal or stool softener)",
            "",
            "Fatigue:",
            "• Ensure adequate iron intake (periods cause iron loss)",
            "• Get 7-9 hours of sleep",
            "• Light exercise for energy boost",
            "• Eat balanced meals with protein",
            "• Consider iron supplements if you have heavy periods",
            "",
            "Breast tenderness:",
            "• Wear a supportive bra",
            "• Reduce caffeine",
            "• Apply warm or cold compress",
            "• OTC pain relievers if needed",
            "",
            "Mood changes:",
            "• Regular exercise",
            "• Stress management techniques",
            "• Adequate sleep",
            "• Talk to friends or family",
            "• Professional counseling for severe mood symptoms",
            "• Consider tracking to identify patterns",
            "",
            "If any symptom is severe or suddenly changes, consult a healthcare provider. You deserve to feel comfortable throughout your cycle."
          ]
        }
      ]
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

  // Show article detail view
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

            <div className="mt-8 pt-8 border-t" style={{ borderColor: '#D4C4EC' }}>
              <p className="text-sm text-center" style={{ color: '#776B7D' }}>
                Was this article helpful? Share your feedback in the Feedback section.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show articles list for selected topic
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

  // Show main topics list with search and filters
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#594F62' }}>Education</h1>
          <p style={{ color: '#776B7D' }}>Empowering knowledge for better menstrual health</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#A592AB' }} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
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
              {showBookmarksOnly ? 'Bookmarked Articles' : 'Search Results'} ({filteredArticles.length})
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
                <p style={{ color: '#776B7D' }}>No articles found. Try adjusting your search or filters.</p>
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
