import { DocumentType } from "@/types";

export interface DocumentTemplateMeta {
  type: DocumentType;
  label: string;
  description: string;
  iconName: string;
  defaultTitle: string;
  starterOutline: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplateMeta[] = [
  {
    type: "article_essay",
    label: "Article or Essay",
    description: "Structured exploration of an idea, cultural observation, or argument.",
    iconName: "FileText",
    defaultTitle: "On the Quiet Persistence of Ideas",
    starterOutline: `# On the Quiet Persistence of Ideas

## Introduction
The premise that initiates this inquiry...

## The Core Thesis
Here we examine the central tension...

## Observations & Nuance
Considering the counterarguments and quiet contradictions...

## Conclusion
A concluding perspective on what remains enduring...`,
  },
  {
    type: "short_story",
    label: "Short Story",
    description: "Narrative fiction with vivid scene setting, interiority, and tension.",
    iconName: "BookOpen",
    defaultTitle: "The Bell at Dunwich",
    starterOutline: `# The Bell at Dunwich

The light had already begun to recede along the shingle beach when the fog crossed the inlet.

There was no sound except the periodic drag of pebbles under the tide...`,
  },
  {
    type: "novel_chapter",
    label: "Novel or Chapter",
    description: "Long-form manuscript segment with chapter heading and scene breaks.",
    iconName: "Layers",
    defaultTitle: "Chapter One: The North Parlor",
    starterOutline: `# Chapter One: The North Parlor

The shutters had remained barred through November. When Julian finally unfastened the iron bolt, the dust rose like powder in the pale light...`,
  },
  {
    type: "poetry",
    label: "Poetry",
    description: "Stanzas, verse, lyrical cadence, and atmospheric imagery.",
    iconName: "Feather",
    defaultTitle: "November Solitude",
    starterOutline: `November Solitude

The frost comes quietly across the lawn,
A silver silence before dawn.
The kettle sings, the paper waits,
Beyond the garden's rusted gates...`,
  },
  {
    type: "personal_reflection",
    label: "Personal Reflection",
    description: "Introspective inquiry on personal growth, memory, or philosophies.",
    iconName: "Heart",
    defaultTitle: "Reflections on Unfinished Work",
    starterOutline: `# Reflections on Unfinished Work

I have often wondered why we hesitate before our most cherished projects.

What is it that stillness asks of us that activity allows us to evade?`,
  },
  {
    type: "diary_entry",
    label: "Diary Entry",
    description: "Intimate daily notebook entry capturing the sights, scents, and thoughts of the day.",
    iconName: "BookMarked",
    defaultTitle: "Notes from the Desk",
    starterOutline: `Morning. Cold rain against the west pane.

Walked by the orchard this afternoon. The apples that fell last month are now buried beneath wet oak leaves.`,
  },
  {
    type: "letter",
    label: "Letter",
    description: "Personal correspondence composed with warmth, care, and deliberation.",
    iconName: "Mail",
    defaultTitle: "A Letter to an Old Friend",
    starterOutline: `To [Recipient],

It has been too long since our last quiet conversation. I am writing to you from my study as the late autumn dusk settles in...

Warmly,
[Your Name]`,
  },
  {
    type: "book_review",
    label: "Book Review",
    description: "Thoughtful critical commentary on a literary work, themes, and prose style.",
    iconName: "BookmarkCheck",
    defaultTitle: "Review: The Waves by Virginia Woolf",
    starterOutline: `# Review: The Waves

**Author:** Virginia Woolf
**Edition:** Hogarth Press

## The Premise & Form
Woolf dispenses with conventional plot in favor of interior dramatic soliloquies...

## Prose & Texture
The rhythm of the language mimics the tidal surge...

## Enduring Resonance
Why this work demands to be re-read across different seasons of life...`,
  },
  {
    type: "script_dialogue",
    label: "Script or Dialogue",
    description: "Character dialogue, stage directions, and scene beats.",
    iconName: "MessageSquare",
    defaultTitle: "Dialogue at Twilight",
    starterOutline: `# Dialogue at Twilight

[SCENE START]
SETTING: A small wooden greenhouse behind an old vicarage. Late afternoon.

ELENA
(arranging terracotta pots)
You didn't answer when the church clock struck five.

THOMAS
(standing in the doorway, rain dripping from his collar)
The path along the river was submerged. I had to take the high woods.

ELENA
You shouldn't have come through the woods in this draft.
[SCENE END]`,
  },
  {
    type: "blank_document",
    label: "Blank Document",
    description: "A clean, unadorned canvas ready for pure inspiration.",
    iconName: "File",
    defaultTitle: "Untitled Document",
    starterOutline: "",
  },
];
