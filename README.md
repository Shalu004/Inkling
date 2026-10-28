# Inkling — AI-Powered Writing & Reading Workspace

> *"Find your thoughts. Find your voice."*  
> *Secondary: "A space for thoughts becoming words."*

Inkling is an editorial, AI-powered writing and reading workspace designed to help writers discover their voice, cultivate nuanced vocabulary, build a sustainable daily practice, and learn from their prose without losing their authentic personality.

---

## 1. Product Overview

Inkling integrates five cohesive literary experiences:
1. **Personal Writing Journal**: A distraction-free canvas with autosave, word goals, writing duration timers, and mood calibration.
2. **AI Writing Coach**: A discerning writing mentor that teaches rather than merely corrects. Identifies linguistic categories, explains underlying grammar principles, offers 4 distinct rewrite tones, recommends practice drills, and never destructively overwrites original writing.
3. **Word Garden**: A lexical discovery and retention workspace featuring dictionary search, pronunciation phonetics, contextual nuance comparisons (e.g. *compelling* vs *effective*), and interactive flashcards.
4. **Reading Corner**: A curated sanctuary of public domain and open literary essays (George Orwell, Ralph Waldo Emerson, Virginia Woolf, Michel de Montaigne) with estimated read times, personal notes, and reading comprehension quizzes.
5. **Two-Minute Spark & Habit Tracker**: Micro-writing prompts with an active 2-minute countdown timer designed to maintain a daily writing streak without the cognitive burden of a full essay.

---

## 2. Brand Identity & Design System

- **Aesthetic**: Literary journal, warm parchment canvas, refined borders, and gentle margin annotations.
- **Logo**: Custom SVG Feather / Ink-stroke emblem with organic geometry and subtle asymmetry.
- **Typography**:
  - **Editorial Serif**: *Newsreader* (Titles, prompts, essays, definitions, reflective prose).
  - **Functional Sans**: *Plus Jakarta Sans* (Navigation, buttons, timers, badges, analytics).
  - **Handwritten Accent**: *Caveat* (Editorial notes, e.g., *"Write freely. Learn gently."*).
- **Exact Color Palette**:
  - Foundation: Parchment (`#FBF9F5`), Paper White (`#FFFFFF`), Warm Border (`#EAE7E0`), Primary Ink (`#222220`), Secondary Ink (`#73726E`).
  - Semantic Wash & Accent Pairs:
    - Daily Prompts & Creative Writing: Wash `#FEF8E7`, Accent `#B88219`
    - Two-Minute Spark: Wash `#FDF0EC`, Accent `#D25D43`
    - Reading Corner: Wash `#EEF5EE`, Accent `#3D724D`
    - Word Garden / Vocabulary: Wash `#F4EFFB`, Accent `#6A4BB2`
    - AI Writing Coach: Wash `#EEF4F8`, Accent `#2D5D7B`

---

## 3. Technology Stack

- **Framework**: Next.js 16+ (App Router, Turbopack, Partial Prerendering)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS v4 with bespoke editorial CSS tokens
- **Typography Loading**: `@next/font/google` (*Newsreader*, *Plus Jakarta Sans*, *Caveat*)
- **Icons**: Lucide Icons
- **Animation & Celebration**: Canvas Confetti
- **Validation**: Zod schema validation for AI payloads and API routes
- **Database & Auth**: PostgreSQL with Supabase migrations, Row Level Security (RLS), and a local persistent engine fallback
- **Testing**: Vitest unit & integration test runner

---

## 4. Application Architecture

```
inkling-writing-workspace/
├── public/                     # Static assets & SVG feather favicon
├── src/
│   ├── app/                    # Next.js App Router routes & API endpoints
│   │   ├── api/
│   │   │   ├── ai/review/      # POST: AI writing analysis & pedagogical feedback
│   │   │   └── dictionary/     # GET: Free Dictionary API & curated lexicon
│   │   ├── calendar/           # Activity timeline and past writings by date
│   │   ├── explore/            # Writing prompts by mood and theme
│   │   ├── progress/           # Progress analytics & Personal Mistake Profile
│   │   ├── read/               # Reading Corner library & essay reader
│   │   ├── review/[id]/        # Comprehensive AI Writing Review interface
│   │   ├── settings/           # User goals, tone calibration, and privacy
│   │   ├── spark/              # Two-Minute Spark micro-writing habit view
│   │   ├── vocabulary/         # Word Garden, dictionary, & flashcards
│   │   ├── write/              # Distraction-free writing editor
│   │   ├── fonts.ts            # Newsreader, Plus Jakarta Sans, Caveat fonts
│   │   ├── globals.css         # Design system tokens, textures, and reduced-motion
│   │   ├── layout.tsx          # Root layout with fonts, viewport, and metadata
│   │   └── page.tsx            # Home dashboard
│   ├── components/
│   │   ├── brand/Logo.tsx      # SVG feather logo and typography wordmark
│   │   ├── calendar/           # Calendar components
│   │   ├── explore/            # Prompt discovery components
│   │   ├── home/               # Dashboard widgets & recommendations
│   │   ├── layout/             # Responsive Navbar & Footer
│   │   ├── progress/           # Progress cards & mistake profile tables
│   │   ├── reading/            # Reading viewer & comprehension quiz
│   │   ├── review/             # Side-by-side diff & rewrite tabs
│   │   ├── settings/           # Preferences & privacy controls
│   │   ├── spark/              # 2-minute countdown micro-writing editor
│   │   ├── ui/                 # Reusable SemanticCard & SemanticBadge
│   │   ├── vocabulary/         # Word Garden grid & flashcard deck
│   │   └── writing/            # Editor, toolbar, & mood selector
│   ├── lib/
│   │   ├── ai/                 # Provider abstraction, Zod schemas, heuristic engine
│   │   ├── curated/            # Curated prompts, readings, and mistake catalog
│   │   ├── store/              # Hybrid persistence store & streak calculator
│   │   └── supabase/           # Supabase client, server admin, and RLS wiring
│   └── types/                  # Domain TypeScript interfaces
├── supabase/
│   ├── migrations/             # Complete PostgreSQL schema & RLS policies
│   └── seed.sql                # Curated seed data (prompts & attributed readings)
├── .env.example                # Safe environment configuration template
├── package.json
└── vitest.config.mjs           # Vitest configuration with path aliases
```

---

## 5. Getting Started Locally

### Prerequisites
- Node.js 20+ (Node 22 LTS recommended)
- npm 10+

### Installation
```bash
# Clone or navigate to the workspace
cd inkling-writing-workspace

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Environment & AI Provider Setup

Inkling is designed with a **zero-configuration out-of-the-box experience**:
- **Without an API key**: The application automatically runs its deep **Pedagogical Heuristic Engine**, analyzing grammar, sentence cadence, throat-clearing fillers, and generating 4 stylistic rewrites and vocabulary exercises.
- **With Google Gemini**: Set `GEMINI_API_KEY` in `.env.local` to enable live cloud LLM analysis.

```env
# .env.local
GEMINI_API_KEY="your-gemini-api-key"
INKLING_AI_MODEL="gemini-1.5-flash"
```

---

## 7. Supabase Setup & Migrations

Inkling provides a hybrid persistence model:
1. **Local Persistent Mode** (Default): Operates instantly in any browser via browser storage with zero external dependencies.
2. **Supabase Cloud Mode**: Add your Supabase project keys in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

### Applying Migrations
Apply the PostgreSQL migration and seed data in your Supabase SQL Editor:
1. Run `supabase/migrations/20261028_init_inkling.sql` (Creates tables, indexes, and user-isolated RLS policies).
2. Run `supabase/seed.sql` (Seeds initial high-caliber prompts and public domain essays).

---

## 8. Verification & Testing

Inkling includes automated unit tests covering the persistence layer, vocabulary lifecycles, streak calculation, and AI review schemas.

```bash
# Run unit tests
npm test

# Run production build
npm run build
```

---

## 9. Security & Privacy

Writing often contains intimate personal reflections:
- **Private Data Isolation**: All database tables enforce Row Level Security (`auth.uid() = user_id`).
- **No Training on User Data**: User writing is never used to train or fine-tune public models.
- **Secret Protection**: API keys and service-role credentials are strictly kept server-side and never exposed to client bundles or committed to Git.
- **Safe Version Control**: Real credentials files (`.env*`) are ignored in `.gitignore`, while `.env.example` remains tracked.

---

## 10. GitHub Repository

- **Repository**: [https://github.com/Shalu004/Inkling](https://github.com/Shalu004/Inkling)
- **Clone**:
  ```bash
  git clone https://github.com/Shalu004/Inkling.git
  ```

---

## 11. License

Crafted for writers, readers, and curious minds. All rights reserved.
