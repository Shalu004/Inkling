import { WritingPrompt, ReadingResource, MistakePattern, IssueCategory } from "@/types";

export const CURATED_PROMPTS: WritingPrompt[] = [
  {
    id: "prompt-solitude",
    title: "The Architecture of Solitude",
    promptText:
      "Explore the delicate distinction between being alone and being lonely. When has solitary silence given you clarity rather than isolation?",
    mood: "reflective",
    category: "Philosophy",
    format: "reflective_essay",
    difficulty: "intermediate",
    suggestedWordsMin: 250,
    suggestedWordsMax: 400,
    guidingQuestions: [
      "How do you know when solitude turns from restorative to draining?",
      "What does physical stillness reveal that busyness conceals?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "A calm, reflective question designed to turn quiet moments into thoughtful prose.",
  },
  {
    id: "prompt-expectation",
    title: "The Mask of Expectation",
    promptText:
      "Examine the difference between who you naturally are when no one is watching and the version of yourself you present to meet societal expectations.",
    mood: "introspective",
    category: "Psychology",
    format: "personal_journal",
    difficulty: "intermediate",
    suggestedWordsMin: 200,
    suggestedWordsMax: 350,
    guidingQuestions: [
      "Which social role is most exhausting to maintain?",
      "Does adapting to others necessarily diminish your authenticity?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Perfect for untangling the layers between public demeanor and private truth.",
  },
  {
    id: "prompt-wonder",
    title: "An Ordinary Wonder",
    promptText:
      "Observe an everyday object on your desk or in your room. Describe its texture, history, and quiet utility without naming it directly in the first paragraph.",
    mood: "observant",
    category: "Creative Prose",
    format: "creative_prose",
    difficulty: "beginner",
    suggestedWordsMin: 150,
    suggestedWordsMax: 300,
    guidingQuestions: [
      "What details become visible only when you look for two full minutes?",
      "What quiet story of human craftsmanship or usage does it carry?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Calibrates attention and sensory precision through everyday perception.",
  },
  {
    id: "prompt-draft",
    title: "The Courage of the First Draft",
    promptText:
      "Write about a project, belief, or path in your life where you had to accept clumsy imperfection before reaching anything worthwhile.",
    mood: "motivated",
    category: "Personal Growth",
    format: "opinion_piece",
    difficulty: "intermediate",
    suggestedWordsMin: 250,
    suggestedWordsMax: 450,
    guidingQuestions: [
      "Why is early clumsiness so painful to endure?",
      "What is the cost of waiting for total certainty before acting?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Invigorating prompt to overcome self-criticism and celebrate initial attempts.",
  },
  {
    id: "prompt-memory",
    title: "The River of Memory",
    promptText:
      "Recall a physical place from your childhood that no longer exists in the same form today. How does memory reconstruct what reality has dismantled?",
    mood: "nostalgic",
    category: "Memoir",
    format: "reflective_essay",
    difficulty: "advanced",
    suggestedWordsMin: 300,
    suggestedWordsMax: 500,
    guidingQuestions: [
      "What smells or sounds trigger this memory instantly?",
      "How reliable is emotional memory compared to factual geography?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Warm exploration of nostalgia, sensory anchors, and temporal distance.",
  },
  {
    id: "prompt-disagreement",
    title: "The Anatomy of a Disagreement",
    promptText:
      "Consider an argument you once had where both sides were genuinely convinced of their righteousness. What underlying values were really in tension?",
    mood: "curious",
    category: "Culture & Society",
    format: "reflective_essay",
    difficulty: "advanced",
    suggestedWordsMin: 300,
    suggestedWordsMax: 500,
    guidingQuestions: [
      "What unstated premise did neither party want to question?",
      "Can two opposing views both contain indispensable truth?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Sharp analytical inquiry into nuance, empathy, and conviction.",
  },
  {
    id: "prompt-quiet-hour",
    title: "The Quiet Hour Before Morning",
    promptText:
      "Describe the sensation of being awake when the world is still asleep. What thoughts only arrive in predawn stillness?",
    mood: "calm",
    category: "Reflection",
    format: "personal_journal",
    difficulty: "beginner",
    suggestedWordsMin: 150,
    suggestedWordsMax: 300,
    guidingQuestions: [
      "How does early morning light change your perspective on time?",
      "What worries disappear before the daytime noise begins?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Gentle, meditative journaling prompt for dawn or late evenings.",
  },
  {
    id: "prompt-friction",
    title: "The Friction of Being Misunderstood",
    promptText:
      "When someone misjudged your motive or intent, did you rush to defend yourself or let the misunderstanding stand? What did that decision teach you?",
    mood: "frustrated",
    category: "Personal Journal",
    format: "reflective_essay",
    difficulty: "intermediate",
    suggestedWordsMin: 200,
    suggestedWordsMax: 400,
    guidingQuestions: [
      "Is explaining yourself always a sign of strength or sometimes fear?",
      "When is silence more eloquent than a rebuttal?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Constructive outlet to channel frustration into clarity of voice.",
  },
  {
    id: "prompt-crossroads",
    title: "Standing at the Crossroads of What If",
    promptText:
      "Reflect on a decision where you chose the uncertain, unpaved route over the predictable one. How do you feel about the alternative life left behind?",
    mood: "uncertain",
    category: "Life Decisions",
    format: "reflective_essay",
    difficulty: "intermediate",
    suggestedWordsMin: 250,
    suggestedWordsMax: 400,
    guidingQuestions: [
      "Do unchosen lives ever completely leave our imagination?",
      "How do you distinguish healthy hesitation from paralyzing doubt?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Thoughtful reflection to embrace ambiguity and personal agency.",
  },
  {
    id: "prompt-letters",
    title: "Letters to a City You Left Behind",
    promptText:
      "Write a letter to a street, neighborhood, or city you once knew intimately. What promise did that place make to your younger self?",
    mood: "creative",
    category: "Creative Non-Fiction",
    format: "creative_prose",
    difficulty: "intermediate",
    suggestedWordsMin: 250,
    suggestedWordsMax: 450,
    guidingQuestions: [
      "How did that city’s rhythm shape the tempo of your thoughts?",
      "If you walked those streets today, who would recognize who?",
    ],
    isCurated: true,
    reasonForRecommendation:
      "Richly imaginative exercise blending place, character, and nostalgia.",
  },
];

export const CURATED_READINGS: ReadingResource[] = [
  {
    id: "read-orwell-why-i-write",
    title: "Why I Write",
    author: "George Orwell",
    sourceName: "The Orwell Foundation",
    sourceUrl:
      "https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/why-i-write/",
    category: "Literary Essay",
    difficulty: "intermediate",
    estimatedReadMinutes: 4,
    excerpt:
      "From a very early age, perhaps the age of five or six, I knew that when I grew up I should be a writer. Between the ages of about seventeen and twenty-four I tried to abandon this idea, but I did so with the consciousness that I was outraging my true nature...",
    fullText: `From a very early age, perhaps the age of five or six, I knew that when I grew up I should be a writer. Between the ages of about seventeen and twenty-four I tried to abandon this idea, but I did so with the consciousness that I was outraging my true nature and that sooner or later I should have to settle down and write books.

Putting aside the need to earn a living, I think there are four great motives for writing, at any rate for writing prose. They exist in different degrees in every writer, and in any one writer the proportions will vary from time to time, according to the atmosphere in which he is living.

They are:
1. Sheer egoism: Desire to seem clever, to be talked about, to be remembered after death, to get your own back on the grown-ups who snubbed you in childhood, etc., etc.
2. Aesthetic enthusiasm: Perception of beauty in the external world, or, on the other hand, in words and their right arrangement. Pleasure in the impact of one sound on another, in the firmness of good prose or the rhythm of a good story.
3. Historical impulse: Desire to see things as they are, to find out true facts and store them up for the use of posterity.
4. Political purpose: Using the word "political" in the widest possible sense. Desire to push the world in a certain direction, to alter other peoples' idea of the kind of society that they should strive after.

Good prose is like a windowpane. I cannot say with certainty which of my motives are the strongest, but I know which of them deserve to be followed.`,
    keyTakeaway:
      "Orwell explains that authentic prose requires reconciling personal voice, aesthetic clarity, and moral purpose: 'Good prose is like a windowpane.'",
    comprehensionQuestions: [
      {
        question:
          "What famous simile does Orwell use to describe good prose?",
        options: [
          "Good prose is like a mirror.",
          "Good prose is like a windowpane.",
          "Good prose is like an unyielding hammer.",
          "Good prose is like a winding river.",
        ],
        answerIndex: 1,
        explanation:
          "Orwell concludes with the timeless aphorism: 'Good prose is like a windowpane'—transparent, clear, and without distorting vanity.",
      },
      {
        question:
          "How does Orwell define 'aesthetic enthusiasm' in writing?",
        options: [
          "Decorating sentences with as many adjectives as possible.",
          "Perception of beauty in the external world and the right arrangement of words and sounds.",
          "Purchasing fine paper and vintage fountain pens.",
          "Writing poetry rather than political essays.",
        ],
        answerIndex: 1,
        explanation:
          "Orwell defines aesthetic enthusiasm as the pleasure derived from the firmness of good prose, harmonious sounds, and rhythm.",
      },
    ],
    isCurated: true,
  },
  {
    id: "read-emerson-self-reliance",
    title: "Self-Reliance",
    author: "Ralph Waldo Emerson",
    sourceName: "Project Gutenberg",
    sourceUrl: "https://www.gutenberg.org/ebooks/16643",
    category: "Philosophy",
    difficulty: "advanced",
    estimatedReadMinutes: 5,
    excerpt:
      "There is a time in every man’s education when he arrives at the conviction that envy is ignorance; that imitation is suicide; that he must take himself for better for worse as his portion...",
    fullText: `There is a time in every man’s education when he arrives at the conviction that envy is ignorance; that imitation is suicide; that he must take himself for better for worse as his portion; that though the wide universe is full of good, no kernel of nourishing corn can come to him but through his toil bestowed on that plot of ground which is given to him to till. The power which resides in him is new in nature, and none but he knows what that is which he can do, nor does he know until he has tried.

Trust thyself: every heart vibrates to that iron string. Accept the place the divine providence has found for you, the society of your contemporaries, the connection of events. Great men have always done so, and confided themselves childlike to the genius of their age, betraying their perception that the absolutely trustworthy was seated at their heart, working through their hands, predominating in all their being.

Whoso would be a man, must be a nonconformist. He who would gather immortal palms must not be hindered by the name of goodness, but must explore if it be goodness. Nothing is at last sacred but the integrity of your own mind.`,
    keyTakeaway:
      "Emerson emphasizes that discovering your own authentic expression requires overcoming the temptation to imitate others: 'Nothing is at last sacred but the integrity of your own mind.'",
    comprehensionQuestions: [
      {
        question: "According to Emerson, what is imitation?",
        options: ["Admiration", "Suicide", "Flattery", "Maturity"],
        answerIndex: 1,
        explanation:
          "Emerson declares unequivocally that 'envy is ignorance; that imitation is suicide'—meaning copying others sacrifices your own unique soul.",
      },
      {
        question:
          "What does Emerson claim is 'at last sacred'?",
        options: [
          "The traditions of ancestors",
          "Public consensus and law",
          "The integrity of your own mind",
          "Academic diplomas and honors",
        ],
        answerIndex: 2,
        explanation:
          "Emerson concludes: 'Nothing is at last sacred but the integrity of your own mind.'",
      },
    ],
    isCurated: true,
  },
  {
    id: "read-woolf-how-to-read",
    title: "How Should One Read a Book?",
    author: "Virginia Woolf",
    sourceName: "Project Gutenberg Australia",
    sourceUrl: "https://gutenberg.net.au/ebooks03/0300031h.html",
    category: "Literary Criticism",
    difficulty: "intermediate",
    estimatedReadMinutes: 4,
    excerpt:
      "The only advice, indeed, that one person can give another about reading is to take no advice, to follow your own instincts, to use your own reason, to come to your own conclusions...",
    fullText: `In the first place, I want to emphasise the note of interrogation at the end of my title. Even if I could answer the question for myself, the answer would only apply to me and not to you. The only advice, indeed, that one person can give another about reading is to take no advice, to follow your own instincts, to use your own reason, to come to your own conclusions.

If this is agreed between us, then I feel at liberty to put forward a few suggestions and ideas, because you will not allow them to fetter that independence which is the most important quality that a reader can possess. After all, what laws can be laid down about books? The Battle of Waterloo was certainly fought on a certain day; but is Hamlet a better play than King Lear? Nobody can say. Each must decide that question for himself.

To admit authorities, however heavily furred and gowned, into our libraries and let them tell us how to read, what to read, what value to place upon what we read, is to destroy the spirit of freedom which is the breath of those sanctuaries. Everywhere else we may be bound by laws and conventions; there we have none.`,
    keyTakeaway:
      "Woolf argues that the true reader maintains complete intellectual autonomy. Libraries are sanctuaries of freedom where no external authority should dictate taste.",
    comprehensionQuestions: [
      {
        question:
          "What is the single piece of advice Woolf claims one person can give another about reading?",
        options: [
          "Always finish every book you start.",
          "To take no advice, follow your own instincts, and come to your own conclusions.",
          "Consult literary critics before beginning a novel.",
          "Read exclusively from the Western canon.",
        ],
        answerIndex: 1,
        explanation:
          "Woolf asserts that independence of mind is paramount: readers must cultivate and trust their own aesthetic impressions.",
      },
      {
        question:
          "Why does Woolf describe libraries as 'sanctuaries'?",
        options: [
          "Because they require silence.",
          "Because they are funded by the state.",
          "Because while elsewhere we are bound by conventions, in reading we enjoy absolute intellectual freedom.",
          "Because books are physically fragile.",
        ],
        answerIndex: 2,
        explanation:
          "Woolf highlights that libraries offer a sanctuary where neither social conventions nor outside authorities can force their judgments upon us.",
      },
    ],
    isCurated: true,
  },
  {
    id: "read-montaigne-solitude",
    title: "Of Solitude",
    author: "Michel de Montaigne",
    sourceName: "Project Gutenberg",
    sourceUrl: "https://www.gutenberg.org/ebooks/3600",
    category: "Philosophy",
    difficulty: "advanced",
    estimatedReadMinutes: 4,
    excerpt:
      "A man must sequester himself from the crowd and reserve a back shop wholly our own and very free, wherein we may establish our true liberty and principal retreat...",
    fullText: `A man must sequester himself from the crowd and reserve a back shop wholly our own and very free, wherein we may establish our true liberty and principal retreat and solitude. In this we must converse most with ourselves, and so privately that no outside company or communication can find a place there.

It is not enough to get away from the people; it is not enough to change the place; a man must fly from the popular conditions that have taken possession of his mind. We must sequester and regain ourselves from ourselves. We carry our fetters along with us; it is not full freedom; we still turn our eyes back upon that which we have left behind.

The greatest thing in the world is to know how to belong to oneself. Retire into yourself, but first prepare to receive yourself there: it were folly to trust yourself in your own hands, if you cannot govern yourself.`,
    keyTakeaway:
      "Montaigne reveals that physical solitude is meaningless if mental clutter accompanies us. Solitude requires having an internal sanctuary where one truly belongs to oneself.",
    comprehensionQuestions: [
      {
        question:
          "According to Montaigne, what is 'the greatest thing in the world'?",
        options: [
          "To be beloved by your contemporaries.",
          "To conquer a foreign empire.",
          "To know how to belong to oneself.",
          "To amass rare manuscripts.",
        ],
        answerIndex: 2,
        explanation:
          "Montaigne writes: 'The greatest thing in the world is to know how to belong to oneself.'",
      },
      {
        question:
          "Why is changing locations not enough to achieve genuine solitude?",
        options: [
          "Because travel is too expensive.",
          "Because we carry our internal habits, fetters, and popular conditions along with us.",
          "Because climate changes our mood.",
          "Because neighbors are the same everywhere.",
        ],
        answerIndex: 1,
        explanation:
          "Montaigne observes that moving places changes nothing unless the mind frees itself from popular anxieties: 'We carry our fetters along with us.'",
      },
    ],
    isCurated: true,
  },
];

export const MISTAKE_RULES_CATALOG: Record<
  IssueCategory,
  { label: string; explanation: string; rule: string }
> = {
  grammar: {
    label: "Grammar & Structure",
    explanation:
      "Grammatical accuracy ensures that the reader's attention remains on your thought rather than parsing mechanics.",
    rule: "Verify word order, clause coordination, and grammatical inflection.",
  },
  tense: {
    label: "Tense Consistency",
    explanation:
      "Unintended shifts between past and present tense disorient the reader's sense of time.",
    rule: "Maintain a steady timeline in reflective prose unless intentionally contrasting a past event with a present realization.",
  },
  subject_verb_agreement: {
    label: "Subject-Verb Agreement",
    explanation:
      "Singular subjects require singular verbs; plural subjects require plural verbs, especially across intervening phrases.",
    rule: "Locate the true head noun of the clause, ignoring prepositional phrases between the subject and verb.",
  },
  articles: {
    label: "Definite & Indefinite Articles",
    explanation:
      "Incorrect or omitted articles ('a', 'an', 'the') subtly distract from natural English rhythm.",
    rule: "Use 'the' for specific, uniquely identifiable entities; use 'a' or 'an' for non-specific, countable nouns.",
  },
  prepositions: {
    label: "Prepositions & Phrasal Idioms",
    explanation:
      "Prepositions are idiomatic and heavily govern verb collocations in English.",
    rule: "Pair verbs with their conventional prepositions (e.g., 'reconcile with', 'perceptive of', 'confide in').",
  },
  punctuation: {
    label: "Punctuation & Flow",
    explanation:
      "Punctuation is the breathing apparatus of prose. Commas, em-dashes, and semicolons dictate rhythm.",
    rule: "Avoid comma splices by connecting independent clauses with a semicolon, period, or coordinating conjunction.",
  },
  spelling: {
    label: "Orthography & Spelling",
    explanation:
      "Accurate orthography builds trust and literary polish.",
    rule: "Double check homophones (e.g., its vs. it's, complement vs. compliment, principal vs. principle).",
  },
  sentence_construction: {
    label: "Sentence Construction & Cadence",
    explanation:
      "Vary sentence lengths to create melodic prose: combine short punchy sentences with graceful longer periods.",
    rule: "Avoid dangling modifiers and keep modifier phrases directly adjacent to the noun they modify.",
  },
  unnatural_expression: {
    label: "Natural Idiom & Phrasing",
    explanation:
      "Direct literal translation or overly convoluted phrasing can sound robotic or awkward in English.",
    rule: "Favor straightforward, native phrasings that flow effortlessly when spoken aloud.",
  },
  repeated_vocabulary: {
    label: "Vocabulary Variety & Nuance",
    explanation:
      "Overusing the same descriptor dulls impact. Choose words with distinct sensory or emotional colors.",
    rule: "Replace repeated adjectives with nuanced alternatives that match the precise shade of meaning.",
  },
  clarity: {
    label: "Clarity of Thought",
    explanation:
      "Good prose is like a windowpane. Strip away needless padding words that obscure your core thesis.",
    rule: "Remove throat-clearing qualifiers (e.g., 'It is interesting to note that') and state the assertion directly.",
  },
  coherence: {
    label: "Paragraph Coherence",
    explanation:
      "Each paragraph should unfold around a single controlling insight.",
    rule: "Ensure each sentence builds logically upon the previous sentence rather than jumping topics abruptly.",
  },
  transitions: {
    label: "Transitions & Connectives",
    explanation:
      "Seamless transitions guide the reader between contrasting reflections or temporal shifts.",
    rule: "Use organic transitions ('Yet', 'Consequently', 'In retrospect', 'Meanwhile') to bridge intellectual shifts.",
  },
};
