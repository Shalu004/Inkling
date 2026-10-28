-- ====================================================================
-- INKLING DATABASE SCHEMA MIGRATION
-- Personal AI-Powered Writing and Reading Workspace
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_genres TEXT[] DEFAULT ARRAY['reflective', 'creative'],
    interests TEXT[] DEFAULT ARRAY['literature', 'philosophy', 'psychology'],
    daily_word_goal INTEGER DEFAULT 250,
    daily_writing_minutes INTEGER DEFAULT 15,
    reading_difficulty TEXT DEFAULT 'intermediate' CHECK (reading_difficulty IN ('beginner', 'intermediate', 'advanced')),
    ai_feedback_tone TEXT DEFAULT 'supportive_rigorous' CHECK (ai_feedback_tone IN ('gentle', 'supportive_rigorous', 'academic')),
    focus_mode_default BOOLEAN DEFAULT false,
    email_reminders BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. WRITING PROMPTS (Curated & AI generated library)
CREATE TABLE IF NOT EXISTS public.writing_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    mood TEXT NOT NULL, -- e.g. reflective, curious, calm, motivated, etc.
    category TEXT NOT NULL, -- personal, essay, creative, opinion, philosophy
    format TEXT DEFAULT 'reflective_essay',
    difficulty TEXT DEFAULT 'intermediate',
    suggested_words_min INTEGER DEFAULT 200,
    suggested_words_max INTEGER DEFAULT 400,
    guiding_questions TEXT[],
    is_curated BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. WRITING SESSIONS (User writings & drafts)
CREATE TABLE IF NOT EXISTS public.writing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES public.writing_prompts(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Reflection',
    content TEXT NOT NULL DEFAULT '',
    mood TEXT,
    format TEXT DEFAULT 'reflective_essay',
    word_count INTEGER DEFAULT 0 NOT NULL,
    duration_seconds INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    has_ai_review BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_writing_sessions_user_date ON public.writing_sessions(user_id, created_at DESC);

-- 5. AI WRITING REVIEWS (Separated from original writing)
CREATE TABLE IF NOT EXISTS public.ai_writing_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.writing_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    overall_strengths TEXT[],
    areas_for_improvement TEXT[],
    clarity_score INTEGER CHECK (clarity_score BETWEEN 0 AND 100),
    next_session_priority TEXT,
    recommended_exercise_title TEXT,
    recommended_exercise_instruction TEXT,
    rewrites JSONB, -- { natural: string, concise: string, expressive: string, formal: string }
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_reviews_session ON public.ai_writing_reviews(session_id);

-- 6. WRITING ISSUES (Granular identified issues with educational rules)
CREATE TABLE IF NOT EXISTS public.writing_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES public.ai_writing_reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    original_excerpt TEXT NOT NULL,
    suggested_correction TEXT NOT NULL,
    category TEXT NOT NULL, -- grammar, tense, agreement, punctuation, clarity, vocabulary, prepositions
    severity TEXT DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high')),
    is_stylistic BOOLEAN DEFAULT false,
    explanation TEXT NOT NULL,
    rule_or_principle TEXT NOT NULL,
    example_sentence TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'reviewed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_writing_issues_user_cat ON public.writing_issues(user_id, category);

-- 7. VOCABULARY ENTRIES (Word Garden)
CREATE TABLE IF NOT EXISTS public.vocabulary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    word TEXT NOT NULL,
    part_of_speech TEXT,
    phonetic TEXT,
    definition TEXT NOT NULL,
    example_sentence TEXT,
    contextual_nuance TEXT,
    source_context TEXT, -- sentence from writing or reading where word was discovered
    source_type TEXT CHECK (source_type IN ('writing_coach', 'reading_corner', 'manual_search')),
    status TEXT DEFAULT 'learning' CHECK (status IN ('learning', 'familiar', 'mastered')),
    review_count INTEGER DEFAULT 0 NOT NULL,
    last_reviewed_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, word)
);

CREATE INDEX IF NOT EXISTS idx_vocab_user_status ON public.vocabulary_entries(user_id, status);

-- 8. READING RESOURCES (Curated literary works, essays, and articles)
CREATE TABLE IF NOT EXISTS public.reading_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    full_text TEXT,
    category TEXT NOT NULL, -- essay, philosophy, literature, psychology, culture
    difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_read_minutes INTEGER DEFAULT 5,
    key_takeaway TEXT,
    comprehension_questions JSONB, -- Array of { question, options, answerIndex, explanation }
    is_curated BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. READING HISTORY & NOTES
CREATE TABLE IF NOT EXISTS public.reading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.reading_resources(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    read_duration_seconds INTEGER DEFAULT 0,
    comprehension_score INTEGER,
    notes TEXT,
    saved_for_later BOOLEAN DEFAULT false,
    last_read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user ON public.reading_history(user_id, last_read_at DESC);

-- 10. TWO-MINUTE SPARKS (Micro-writing daily habit)
CREATE TABLE IF NOT EXISTS public.two_minute_sparks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 120 NOT NULL,
    word_count INTEGER DEFAULT 0 NOT NULL,
    task_category TEXT NOT NULL, -- mood_3_sentences, noticed_today, sentence_rewrite, vocab_in_use, 50_word_opinion
    saved_to_journal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_two_minute_sparks_user ON public.two_minute_sparks(user_id, created_at DESC);

-- 11. DAILY ACTIVITIES & HABIT TRACKING
CREATE TABLE IF NOT EXISTS public.daily_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_date DATE NOT NULL,
    words_written INTEGER DEFAULT 0 NOT NULL,
    writing_sessions_count INTEGER DEFAULT 0 NOT NULL,
    sparks_completed INTEGER DEFAULT 0 NOT NULL,
    readings_completed INTEGER DEFAULT 0 NOT NULL,
    vocab_reviewed INTEGER DEFAULT 0 NOT NULL,
    streak_count INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_act_user_date ON public.daily_activities(user_id, activity_date DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_writing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_minute_sparks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- Reading resources & curated prompts are publicly readable
ALTER TABLE public.reading_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reading resources are viewable by all authenticated users"
    ON public.reading_resources FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Writing prompts are viewable by all authenticated users"
    ON public.writing_prompts FOR SELECT
    TO authenticated
    USING (true);

-- User Isolation Policies
CREATE POLICY "Users can view and edit their own profile"
    ON public.profiles FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage their own preferences"
    ON public.user_preferences FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own writing sessions"
    ON public.writing_sessions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI writing reviews"
    ON public.ai_writing_reviews FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own writing issues"
    ON public.writing_issues FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own vocabulary entries"
    ON public.vocabulary_entries FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reading history"
    ON public.reading_history FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sparks"
    ON public.two_minute_sparks FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and update their daily activities"
    ON public.daily_activities FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
