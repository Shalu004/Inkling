-- ====================================================================
-- INKLING SEED DATA
-- Curated high-caliber writing prompts and literary reading resources
-- ====================================================================

-- CURATED WRITING PROMPTS ACROSS MOODS
INSERT INTO public.writing_prompts (title, prompt_text, mood, category, format, difficulty, suggested_words_min, suggested_words_max, guiding_questions)
VALUES
(
    'The Architecture of Solitude',
    'Explore the delicate distinction between being alone and being lonely. When has solitary silence given you clarity rather than isolation?',
    'reflective',
    'philosophy',
    'reflective_essay',
    'intermediate',
    250,
    400,
    ARRAY['How do you know when solitude turns from restorative to draining?', 'What does physical stillness reveal that busyness conceals?']
),
(
    'The Mask of Expectation',
    'Examine the difference between who you naturally are when no one is watching and the version of yourself you present to meet societal expectations.',
    'introspective',
    'psychology',
    'personal_reflection',
    'intermediate',
    200,
    350,
    ARRAY['Which expectation was hardest to shed?', 'Does adapting to social roles always mean compromising authenticity?']
),
(
    'An Ordinary Wonder',
    'Observe an everyday object on your desk or in your room. Describe its texture, history, and quiet utility without naming it directly in the first paragraph.',
    'observant',
    'creative',
    'creative_prose',
    'beginner',
    150,
    300,
    ARRAY['What details become visible only when you look for two full minutes?', 'What story of craftsmanship does this object carry?']
),
(
    'The Courage of the First Draft',
    'Write about a project, belief, or path in your life where you had to accept clumsy imperfection before reaching anything worthwhile.',
    'motivated',
    'personal',
    'opinion_piece',
    'intermediate',
    250,
    450,
    ARRAY['Why is early clumsiness so painful to endure?', 'What is the price of waiting for certainty before acting?']
),
(
    'The River of Memory',
    'Recall a physical place from your childhood that no longer exists in the same form today. How does memory reconstruct what reality has dismantled?',
    'nostalgic',
    'memoir',
    'reflective_essay',
    'advanced',
    300,
    500,
    ARRAY['What smells or sounds trigger this memory instantly?', 'How reliable is emotional memory compared to factual history?']
),
(
    'The Anatomy of a Disagreement',
    'Consider an argument you once had where both sides were genuinely convinced of their righteousness. What underlying values were really in tension?',
    'curious',
    'culture',
    'analytical_essay',
    'advanced',
    300,
    500,
    ARRAY['What assumption did each person refuse to question?', 'Can two opposing views both contain essential truth?']
);

-- CURATED READING RESOURCES WITH PROPER ATTRIBUTIONS & VERIFIED SOURCES
INSERT INTO public.reading_resources (title, author, source_name, source_url, excerpt, full_text, category, difficulty, estimated_read_minutes, key_takeaway, comprehension_questions)
VALUES
(
    'Why I Write',
    'George Orwell',
    'The Orwell Foundation',
    'https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/why-i-write/',
    'From a very early age, perhaps the age of five or six, I knew that when I grew up I should be a writer. Between the ages of about seventeen and twenty-four I tried to abandon this idea, but I did so with the consciousness that I was outraging my true nature and that sooner or later I should have to settle down and write books.',
    'From a very early age, perhaps the age of five or six, I knew that when I grew up I should be a writer. Between the ages of about seventeen and twenty-four I tried to abandon this idea, but I did so with the consciousness that I was outraging my true nature and that sooner or later I should have to settle down and write books.\n\nPutting aside the need to earn a living, I think there are four great motives for writing, at any rate for writing prose. They exist in different degrees in every writer, and in any one writer the proportions will vary from time to time, according to the atmosphere in which he is living. They are: (1) Sheer egoism; (2) Aesthetic enthusiasm; (3) Historical impulse; (4) Political purpose. Using the word "political" in the widest possible sense. Desire to push the world in a certain direction, to alter other peoples’ idea of the kind of society that they should strive after.',
    'essay',
    'intermediate',
    4,
    'Orwell identifies four driving motives behind writing prose: sheer egoism, aesthetic enthusiasm, historical impulse, and political purpose.',
    '[
        {"question": "According to Orwell, what are the four primary motives for writing prose?", "options": ["Wealth, fame, revenge, and religion", "Sheer egoism, aesthetic enthusiasm, historical impulse, and political purpose", "Instruction, academic tenure, leisure, and curiosity", "Social conformity, boredom, commercial demand, and duty"], "answerIndex": 1, "explanation": "Orwell explicitly delineates sheer egoism, aesthetic enthusiasm, historical impulse, and political purpose as the four great drivers."},
        {"question": "What does Orwell mean by ''political purpose'' in this context?", "options": ["Running for elected office", "Desire to alter other peoples perspective on what society should strive toward", "Writing exclusively about government bureaucracy", "Obeying party doctrine"], "answerIndex": 1, "explanation": "He clarifies that he uses ''political'' in the widest sense: the desire to push the world in a certain direction."}
    ]'::jsonb
),
(
    'Self-Reliance',
    'Ralph Waldo Emerson',
    'Project Gutenberg',
    'https://www.gutenberg.org/ebooks/16643',
    'There is a time in every man’s education when he arrives at the conviction that envy is ignorance; that imitation is suicide; that he must take himself for better for worse as his portion; that though the wide universe is full of good, no kernel of nourishing corn can come to him but through his toil bestowed on that plot of ground which is given to him to till.',
    'There is a time in every man’s education when he arrives at the conviction that envy is ignorance; that imitation is suicide; that he must take himself for better for worse as his portion; that though the wide universe is full of good, no kernel of nourishing corn can come to him but through his toil bestowed on that plot of ground which is given to him to till. The power which resides in him is new in nature, and none but he knows what that is which he can do, nor does he know until he has tried.\n\nTrust thyself: every heart vibrates to that iron string. Accept the place the divine providence has found for you, the society of your contemporaries, the connection of events. Great men have always done so, and confided themselves childlike to the genius of their age, betraying their perception that the absolutely trustworthy was seated at their heart, working through their hands, predominating in all their being.',
    'philosophy',
    'advanced',
    5,
    'True intellectual and spiritual growth requires trusting one’s own unique faculties rather than imitating the conventions or judgments of others.',
    '[
        {"question": "What does Emerson famously equate with imitation in this opening passage?", "options": ["Wisdom", "Suicide", "Flattery", "Virtue"], "answerIndex": 1, "explanation": "Emerson writes that ''imitation is suicide,'' meaning that suppressing your authentic perspective destroys what is uniquely yours."},
        {"question": "What metaphor does Emerson use for developing personal potential?", "options": ["Sailing into an unknown sea", "Tilling the plot of ground given to you", "Carving a marble statue", "Ascending a mountain"], "answerIndex": 1, "explanation": "He speaks of nourishing corn coming only through toil on ''that plot of ground which is given to him to till.'"}
    ]'::jsonb
),
(
    'How Should One Read a Book?',
    'Virginia Woolf',
    'Project Gutenberg Australia',
    'https://gutenberg.net.au/ebooks03/0300031h.html',
    'In the first place, I want to emphasise the note of interrogation at the end of my title. Even if I could answer the question for myself, the answer would only apply to me and not to you. The only advice, indeed, that one person can give another about reading is to take no advice, to follow your own instincts, to use your own reason, to come to your own conclusions.',
    'In the first place, I want to emphasise the note of interrogation at the end of my title. Even if I could answer the question for myself, the answer would only apply to me and not to you. The only advice, indeed, that one person can give another about reading is to take no advice, to follow your own instincts, to use your own reason, to come to your own conclusions.\n\nIf this is agreed between us, then I feel at liberty to put forward a few suggestions and ideas, because you will not allow them to fetter that independence which is the most important quality that a reader can possess. After all, what laws can be laid down about books? The Battle of Waterloo was certainly fought on a certain day; but is Hamlet a better play than King Lear? Nobody can say. Each must decide that question for himself. To admit authorities, however heavily furred and gowned, into our libraries and let them tell us how to read, what to read, what value to place upon what we read, is to destroy the spirit of freedom which is the breath of those sanctuaries.',
    'literature',
    'intermediate',
    4,
    'Woolf champions reader independence: the greatest asset of a reader is an open mind that trusts its own critical instincts rather than deferring blindly to external authority.',
    '[
        {"question": "What is the primary advice Woolf offers regarding reading?", "options": ["Read only canonical classics", "Take no advice and follow your own instincts and reason", "Read as rapidly as possible", "Summarize every chapter in a notebook"], "answerIndex": 1, "explanation": "Woolf writes: ''The only advice, indeed, that one person can give another about reading is to take no advice, to follow your own instincts, to use your own reason...''"},
        {"question": "Why does Woolf warn against letting authorities dictate how to read?", "options": ["It increases book prices", "It destroys the spirit of intellectual freedom", "Authorities rarely read fiction", "It causes readers to read too slowly"], "answerIndex": 1, "explanation": "She warns that admitting outside arbiters into our libraries destroys the spirit of freedom that makes reading transformative."}
    ]'::jsonb
);
