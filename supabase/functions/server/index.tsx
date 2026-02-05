import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1aee76a8/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-1aee76a8/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.error(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.error(`Signup error during request parsing: ${error}`);
    return c.json({ error: 'Invalid request data' }, 400);
  }
});

// Period tracker endpoints
app.post("/make-server-1aee76a8/period/log", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { startDate, endDate, flow, symptoms, notes } = await c.req.json();
    const key = `period_${user.id}_${startDate}`;

    await kv.set(key, { startDate, endDate, flow, symptoms, notes, userId: user.id });
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error logging period: ${error}`);
    return c.json({ error: 'Failed to log period' }, 500);
  }
});

app.get("/make-server-1aee76a8/period/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const prefix = `period_${user.id}_`;
    const periods = await kv.getByPrefix(prefix);
    
    return c.json({ periods });
  } catch (error) {
    console.error(`Error fetching period history: ${error}`);
    return c.json({ error: 'Failed to fetch period history' }, 500);
  }
});

// Education endpoints
app.get("/make-server-1aee76a8/education/user-data", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookmarksKey = `education_bookmarks_${user.id}`;
    const progressKey = `education_progress_${user.id}`;

    const bookmarks = await kv.get(bookmarksKey) || [];
    const progress = await kv.get(progressKey) || {};
    
    return c.json({ bookmarks, progress });
  } catch (error) {
    console.error(`Error fetching education user data: ${error}`);
    return c.json({ error: 'Failed to fetch user data' }, 500);
  }
});

app.post("/make-server-1aee76a8/education/bookmark", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { articleId, bookmarked } = await c.req.json();
    const key = `education_bookmarks_${user.id}`;

    let bookmarks = await kv.get(key) || [];

    if (bookmarked) {
      if (!bookmarks.includes(articleId)) {
        bookmarks.push(articleId);
      }
    } else {
      bookmarks = bookmarks.filter((id: string) => id !== articleId);
    }

    await kv.set(key, bookmarks);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error toggling bookmark: ${error}`);
    return c.json({ error: 'Failed to toggle bookmark' }, 500);
  }
});

app.post("/make-server-1aee76a8/education/progress", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { articleId, progress } = await c.req.json();
    const key = `education_progress_${user.id}`;

    let progressData = await kv.get(key) || {};
    progressData[articleId] = progress;

    await kv.set(key, progressData);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error saving progress: ${error}`);
    return c.json({ error: 'Failed to save progress' }, 500);
  }
});

// Submit feedback
app.post("/make-server-1aee76a8/feedback", async (c) => {
  try {
    const feedbackData = await c.req.json();
    const timestamp = new Date().toISOString();
    const feedbackId = `feedback:${timestamp}:${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(feedbackId, { ...feedbackData, timestamp });
    
    return c.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(`Feedback submission error: ${error}`);
    return c.json({ error: 'Failed to submit feedback' }, 500);
  }
});

// Profile picture upload
app.post("/make-server-1aee76a8/profile/picture", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { picture } = await c.req.json();
    
    // Store the base64 image in KV store
    const key = `profile_picture_${user.id}`;
    await kv.set(key, picture);
    
    // Return the same base64 string as URL (client will use it directly)
    return c.json({ url: picture });
  } catch (error) {
    console.error(`Profile picture upload error: ${error}`);
    return c.json({ error: 'Failed to upload profile picture' }, 500);
  }
});

// Community endpoints
app.get("/make-server-1aee76a8/community/data", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all categories
    const categories = await kv.getByPrefix('community_category_');
    
    // Get all threads
    const threads = await kv.getByPrefix('community_thread_');
    
    // Get all posts
    const posts = await kv.getByPrefix('community_post_');
    
    // Get user's joined communities
    const joinedKey = `community_joined_${user.id}`;
    const joinedCategories = await kv.get(joinedKey) || [];
    
    // Seed data if empty
    if (categories.length === 0) {
      const seedCategories = [
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
          membersCount: 88,
        },
        {
          id: "c-3",
          title: "Cramps & Pain Support",
          description: "Home tips, comfort routines, when to seek help.",
          icon: "💊",
          membersCount: 67,
        },
        {
          id: "c-4",
          title: "Myths & Stigma",
          description: "Break stigma, share facts, and support each other.",
          icon: "💬",
          membersCount: 52,
        },
      ];
      
      for (const cat of seedCategories) {
        await kv.set(`community_category_${cat.id}`, cat);
      }
      
      const seedThreads = [
        {
          id: "t-1",
          categoryId: "c-1",
          title: "What's considered a normal cycle length?",
          createdBy: "Ejama Team",
          createdAt: "Today",
        },
        {
          id: "t-2",
          categoryId: "c-3",
          title: "What helps you most with cramps?",
          createdBy: "Community",
          createdAt: "Today",
        },
        {
          id: "t-3",
          categoryId: "c-2",
          title: "Pads vs tampons: how did you choose?",
          createdBy: "Community",
          createdAt: "Today",
        },
      ];
      
      for (const thread of seedThreads) {
        await kv.set(`community_thread_${thread.id}`, thread);
      }
      
      const seedPosts = [
        {
          id: "p-1",
          threadId: "t-1",
          author: "Ejama Team",
          createdAt: "Today",
          content:
            "Many people have cycles between 21–35 days. What's \"normal\" can vary — the key is consistency for YOU. If there's a sudden change, it may be worth checking with a healthcare professional.",
          likes: 4,
        },
        {
          id: "p-2",
          threadId: "t-2",
          author: "Amina",
          createdAt: "Today",
          content:
            "Heat pad + ginger tea + light stretching works for me. If it's really bad I rest and avoid caffeine.",
          likes: 7,
        },
        {
          id: "p-3",
          threadId: "t-3",
          author: "Chidera",
          createdAt: "Today",
          content:
            "I started with pads then tried tampons later. Comfort + activity level mattered most. Also having access and good hygiene helped.",
          likes: 3,
        },
      ];
      
      for (const post of seedPosts) {
        await kv.set(`community_post_${post.id}`, post);
      }
      
      return c.json({
        categories: seedCategories,
        threads: seedThreads,
        posts: seedPosts,
        joinedCategories,
      });
    }
    
    return c.json({ categories, threads, posts, joinedCategories });
  } catch (error) {
    console.error(`Error fetching community data: ${error}`);
    return c.json({ error: 'Failed to fetch community data' }, 500);
  }
});

app.post("/make-server-1aee76a8/community/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, description, icon } = await c.req.json();
    const categoryId = `c-${Date.now()}`;
    
    const category = {
      id: categoryId,
      title,
      description,
      icon,
      membersCount: 1,
      createdBy: user.id,
    };
    
    await kv.set(`community_category_${categoryId}`, category);
    
    return c.json({ category });
  } catch (error) {
    console.error(`Error creating community: ${error}`);
    return c.json({ error: 'Failed to create community' }, 500);
  }
});

app.post("/make-server-1aee76a8/community/join", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { categoryId, join } = await c.req.json();
    const key = `community_joined_${user.id}`;
    
    let joinedCategories = await kv.get(key) || [];
    
    if (join) {
      if (!joinedCategories.includes(categoryId)) {
        joinedCategories.push(categoryId);
      }
    } else {
      joinedCategories = joinedCategories.filter((id: string) => id !== categoryId);
    }
    
    await kv.set(key, joinedCategories);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error joining/leaving community: ${error}`);
    return c.json({ error: 'Failed to update membership' }, 500);
  }
});

// Health Tips endpoints
app.get("/make-server-1aee76a8/health-tips/user-data", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookmarksKey = `health_tips_bookmarks_${user.id}`;
    const progressKey = `health_tips_progress_${user.id}`;

    const bookmarks = await kv.get(bookmarksKey) || [];
    const progress = await kv.get(progressKey) || {};
    
    return c.json({ bookmarks, progress });
  } catch (error) {
    console.error(`Error fetching health tips user data: ${error}`);
    return c.json({ error: 'Failed to fetch user data' }, 500);
  }
});

app.post("/make-server-1aee76a8/health-tips/bookmark", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { articleId, bookmarked } = await c.req.json();
    const key = `health_tips_bookmarks_${user.id}`;

    let bookmarks = await kv.get(key) || [];

    if (bookmarked) {
      if (!bookmarks.includes(articleId)) {
        bookmarks.push(articleId);
      }
    } else {
      bookmarks = bookmarks.filter((id: string) => id !== articleId);
    }

    await kv.set(key, bookmarks);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error toggling health tips bookmark: ${error}`);
    return c.json({ error: 'Failed to toggle bookmark' }, 500);
  }
});

app.post("/make-server-1aee76a8/health-tips/progress", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { articleId, progress } = await c.req.json();
    const key = `health_tips_progress_${user.id}`;

    let progressData = await kv.get(key) || {};
    progressData[articleId] = progress;

    await kv.set(key, progressData);
    
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error saving health tips progress: ${error}`);
    return c.json({ error: 'Failed to save progress' }, 500);
  }
});

// Ask the Expert endpoints
app.get("/make-server-1aee76a8/ask-expert/questions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all public questions
    const allQuestions = await kv.getByPrefix('ask_expert_question_');
    
    // Filter to only public questions
    const publicQuestions = allQuestions.filter((q: any) => !q.isPrivate);
    
    // Seed data if empty
    if (publicQuestions.length === 0) {
      const seedQuestions = [
        {
          id: "q-1",
          question: "What's considered a normal amount of bleeding during a period?",
          category: "Menstrual Health",
          isPrivate: false,
          askedBy: "anonymous",
          askedAt: "2 days ago",
          answer: "A typical period involves losing about 30-40ml of blood over 3-7 days. Heavy bleeding (menorrhagia) is when you lose more than 80ml or need to change protection every 1-2 hours. If you're soaking through pads/tampons frequently or passing large clots, consult a healthcare provider.",
          answeredBy: "Dr. Amina Hassan",
          answeredAt: "1 day ago",
          status: "answered" as const,
        },
        {
          id: "q-2",
          question: "Are menstrual cups safe to use?",
          category: "Products & Hygiene",
          isPrivate: false,
          askedBy: "anonymous",
          askedAt: "3 days ago",
          answer: "Yes, menstrual cups are safe when used correctly. They're made from medical-grade silicone and can be worn for up to 12 hours. Make sure to wash your hands before insertion/removal, clean the cup thoroughly, and boil it between cycles. If you experience any irritation or unusual symptoms, discontinue use and consult a healthcare provider.",
          answeredBy: "Dr. Sarah Okonkwo",
          answeredAt: "2 days ago",
          status: "answered" as const,
        },
        {
          id: "q-3",
          question: "How can I reduce severe period cramps naturally?",
          category: "Pain Management",
          isPrivate: false,
          askedBy: "anonymous",
          askedAt: "5 days ago",
          status: "pending" as const,
        },
      ];
      
      for (const q of seedQuestions) {
        await kv.set(`ask_expert_question_${q.id}`, q);
      }
      
      return c.json({ questions: seedQuestions });
    }
    
    return c.json({ questions: publicQuestions });
  } catch (error) {
    console.error(`Error fetching expert questions: ${error}`);
    return c.json({ error: 'Failed to fetch questions' }, 500);
  }
});

app.get("/make-server-1aee76a8/ask-expert/my-questions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user's questions
    const key = `ask_expert_user_questions_${user.id}`;
    const userQuestionIds = await kv.get(key) || [];
    
    const questions = [];
    for (const id of userQuestionIds) {
      const question = await kv.get(`ask_expert_question_${id}`);
      if (question) {
        questions.push(question);
      }
    }
    
    return c.json({ questions });
  } catch (error) {
    console.error(`Error fetching user questions: ${error}`);
    return c.json({ error: 'Failed to fetch questions' }, 500);
  }
});

app.post("/make-server-1aee76a8/ask-expert/submit", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { question, category, isPrivate } = await c.req.json();
    
    const questionId = `q-${Date.now()}`;
    const newQuestion = {
      id: questionId,
      question,
      category,
      isPrivate,
      askedBy: user.id,
      askedAt: "Just now",
      status: "pending" as const,
    };
    
    // Save the question
    await kv.set(`ask_expert_question_${questionId}`, newQuestion);
    
    // Add to user's questions list
    const userQuestionsKey = `ask_expert_user_questions_${user.id}`;
    const userQuestions = await kv.get(userQuestionsKey) || [];
    userQuestions.unshift(questionId);
    await kv.set(userQuestionsKey, userQuestions);
    
    return c.json({ question: newQuestion });
  } catch (error) {
    console.error(`Error submitting question: ${error}`);
    return c.json({ error: 'Failed to submit question' }, 500);
  }
});

Deno.serve(app.fetch);