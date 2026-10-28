import { NextRequest, NextResponse } from "next/server";

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence?: string;
  synonyms: string[];
  antonyms: string[];
  nuances?: string;
}

const LOCAL_FALLBACK_LEXICON: Record<string, DictionaryEntry> = {
  luminescent: {
    word: "luminescent",
    phonetic: "/ˌluːmɪˈnɛsənt/",
    partOfSpeech: "adjective",
    definition: "Emitting light not caused by heat; possessing a gentle, radiant glow.",
    exampleSentence: "The predawn horizon carried a luminescent pale gold hue.",
    synonyms: ["radiant", "gleaming", "phosphorescent", "effulgent"],
    antonyms: ["dim", "opaque", "tarnished"],
    nuances:
      "Unlike 'bright' or 'glaring', 'luminescent' conveys a soft, self-sustained radiance with poetic subtlety.",
  },
  discernment: {
    word: "discernment",
    phonetic: "/dɪˈsɜːrnmənt/",
    partOfSpeech: "noun",
    definition: "The ability to judge well; keen perception and intellectual taste.",
    exampleSentence: "She read with rare discernment, detecting unspoken tensions between the lines.",
    synonyms: ["insight", "acumen", "penetration", "perspicacity"],
    antonyms: ["naivety", "shallowness", "blindness"],
    nuances:
      "'Discernment' emphasizes intellectual refinement and moral nuance rather than raw analytical speed.",
  },
  compelling: {
    word: "compelling",
    phonetic: "/kəmˈpɛlɪŋ/",
    partOfSpeech: "adjective",
    definition: "Evoking interest, attention, or admiration in a powerfully irresistible way.",
    exampleSentence: "His essay offered a compelling defense of solitary reflection.",
    synonyms: ["captivating", "persuasive", "arresting", "cogent"],
    antonyms: ["unconvincing", "dull", "feeble"],
    nuances:
      "Distinction: 'Effective' means it achieves a result; 'Compelling' means it forcefully captures imagination and belief.",
  },
  evocative: {
    word: "evocative",
    phonetic: "/ɪˈvɒkətɪv/",
    partOfSpeech: "adjective",
    definition: "Bringing strong images, memories, or feelings to mind.",
    exampleSentence: "The scent of cedar was immediately evocative of grandfather's quiet study.",
    synonyms: ["resonant", "reminiscent", "expressive", "stirring"],
    antonyms: ["nondescript", "vacuous", "uninspired"],
    nuances:
      "'Evocative' is specifically tied to triggering latent memory, nostalgic warmth, or sensory recall.",
  },
  manifold: {
    word: "manifold",
    phonetic: "/ˈmænɪfəʊld/",
    partOfSpeech: "adjective",
    definition: "Many and various; having many distinct aspects, facets, or applications.",
    exampleSentence: "The benefits of consistent writing are manifold and often arrive quietly.",
    synonyms: ["multifaceted", "diverse", "copious", "myriad"],
    antonyms: ["singular", "uniform", "simple"],
    nuances:
      "Use 'manifold' when you want to highlight diversity of form, rather than merely large quantity.",
  },
  ineffable: {
    word: "ineffable",
    phonetic: "/ɪnˈɛfəbəl/",
    partOfSpeech: "adjective",
    definition: "Too great or extreme to be expressed or described in words.",
    exampleSentence: "There was an ineffable serenity to the stillness of the midnight valley.",
    synonyms: ["indescribable", "unutterable", "transcendent"],
    antonyms: ["expressible", "mundane", "definable"],
    nuances:
      "Reserved for profound emotional or spiritual experiences that defy conventional vocabulary.",
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word")?.trim().toLowerCase();

  if (!word) {
    return NextResponse.json({ error: "Missing word parameter" }, { status: 400 });
  }

  // Check local curated lexicon first for rich nuance
  if (LOCAL_FALLBACK_LEXICON[word]) {
    return NextResponse.json({
      success: true,
      entry: LOCAL_FALLBACK_LEXICON[word],
      source: "curated_lexicon",
    });
  }

  // Query Free Dictionary API
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      next: { revalidate: 86400 }, // Cache for 24h
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const meaning = item.meanings?.[0];
        const defObj = meaning?.definitions?.[0];

        const synonyms = meaning?.synonyms?.slice(0, 5) || [];
        const antonyms = meaning?.antonyms?.slice(0, 5) || [];

        return NextResponse.json({
          success: true,
          entry: {
            word: item.word,
            phonetic: item.phonetic || item.phonetics?.[0]?.text,
            partOfSpeech: meaning?.partOfSpeech || "noun",
            definition: defObj?.definition || "Definition not available.",
            exampleSentence: defObj?.example || `A thoughtful example using "${item.word}".`,
            synonyms,
            antonyms,
            nuances: `Pay attention to how "${item.word}" pairs with adjacent nouns to elevate precision.`,
          },
          source: "dictionary_api",
        });
      }
    }
  } catch (err) {
    console.warn("Dictionary API fetch failed, checking fallback:", err);
  }

  // Graceful fallback for any searched word
  return NextResponse.json({
    success: true,
    entry: {
      word,
      partOfSpeech: "noun / adjective",
      definition: `A lexical term explored within Inkling's Word Garden.`,
      exampleSentence: `Cultivating "${word}" allows you to express thoughts with finer literary calibration.`,
      synonyms: ["refined expression", "precise diction"],
      antonyms: [],
      nuances: `Use "${word}" when other standard terms fail to capture the exact shade of meaning.`,
    },
    source: "generic_lexical_fallback",
  });
}
