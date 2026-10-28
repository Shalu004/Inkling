import { NextRequest, NextResponse } from "next/server";
import { DictionaryLookupResult, DictionaryMeaning } from "@/types";

const LOCAL_CURATED_LEXICON: Record<string, Partial<DictionaryLookupResult>> = {
  luminescent: {
    word: "luminescent",
    phonetic: "/ˌluːmɪˈnɛsənt/",
    meanings: [
      {
        partOfSpeech: "adjective",
        definitions: [
          {
            definition: "Emitting light not caused by heat; possessing a gentle, radiant glow.",
            example: "The predawn horizon carried a luminescent pale gold hue.",
            synonyms: ["radiant", "gleaming", "phosphorescent", "effulgent"],
            antonyms: ["dim", "opaque", "tarnished"],
          },
        ],
      },
    ],
    synonyms: ["radiant", "gleaming", "phosphorescent", "effulgent"],
    antonyms: ["dim", "opaque", "tarnished"],
    nuancedDistinction:
      "Unlike 'bright' or 'glaring', 'luminescent' conveys a soft, self-sustained radiance with poetic subtlety.",
    etymology: "From Latin lumen ('light') + -escence ('beginning to be').",
    source: "curated_lexicon",
  },
  petrichor: {
    word: "petrichor",
    phonetic: "/ˈpɛtrɪkɔːr/",
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "A pleasant, distinctive smell that frequently accompanies the first rain after a long period of warm, dry weather.",
            example: "Opening the study window, he breathed in the sharp, earthen petrichor of the afternoon squall.",
            synonyms: ["earthy scent", "rain-scent", "geosmin"],
            antonyms: [],
          },
        ],
      },
    ],
    synonyms: ["earthy fragrance", "rain aroma"],
    antonyms: [],
    nuancedDistinction:
      "Unlike generic 'dampness', petrichor specifically denotes the chemical aroma released by plant oils trapped in clay and rocks.",
    etymology: "Coined in 1964 from Greek petra ('stone') + ichor ('ethereal fluid of gods').",
    source: "curated_lexicon",
  },
  ephemeral: {
    word: "ephemeral",
    phonetic: "/ɪˈfɛmərəl/",
    meanings: [
      {
        partOfSpeech: "adjective",
        definitions: [
          {
            definition: "Lasting for a very short time; transitory and delicate.",
            example: "The evening mist over the lake was lovely precisely because it was ephemeral.",
            synonyms: ["fleeting", "transient", "fugitive", "evanescent"],
            antonyms: ["enduring", "perpetual", "eternal"],
          },
        ],
      },
    ],
    synonyms: ["fleeting", "transient", "evanescent"],
    antonyms: ["enduring", "permanent"],
    nuancedDistinction:
      "'Ephemeral' highlights inherent fragility and temporal beauty, whereas 'temporary' simply marks an administrative end date.",
    etymology: "From Greek ephemeros ('lasting only a day').",
    source: "curated_lexicon",
  },
  ineffable: {
    word: "ineffable",
    phonetic: "/ɪnˈɛfəbəl/",
    meanings: [
      {
        partOfSpeech: "adjective",
        definitions: [
          {
            definition: "Too great or extreme to be expressed or described in words.",
            example: "There was an ineffable serenity to the stillness of the midnight valley.",
            synonyms: ["indescribable", "unutterable", "transcendent"],
            antonyms: ["expressible", "mundane", "definable"],
          },
        ],
      },
    ],
    synonyms: ["indescribable", "unutterable"],
    antonyms: ["definable"],
    nuancedDistinction:
      "Reserved for profound emotional or spiritual experiences that defy conventional vocabulary.",
    etymology: "From Latin ineffabilis ('not speakable').",
    source: "curated_lexicon",
  },
  conceited: {
    word: "conceited",
    phonetic: "/kənˈsiːtɪd/",
    meanings: [
      {
        partOfSpeech: "adjective",
        definitions: [
          {
            definition: "Excessively proud of oneself; vain.",
            example: "She found his boastful comments thoroughly conceited.",
            synonyms: ["vain", "narcissistic", "arrogant", "egotistical"],
            antonyms: ["humble", "modest", "self-effacing"],
          },
        ],
      },
    ],
    synonyms: ["vain", "egotistical", "arrogant"],
    antonyms: ["humble", "modest"],
    nuancedDistinction:
      "'Conceited' implies shallow vanity about appearance or status, whereas 'arrogant' implies an overbearing assertion of power.",
    etymology: "From Middle English conceit ('personal opinion, vanity').",
    source: "curated_lexicon",
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawWord = searchParams.get("word")?.trim().toLowerCase();

  if (!rawWord) {
    return NextResponse.json({ error: "Missing word parameter" }, { status: 400 });
  }

  // 1. Check local curated lexicon first
  if (LOCAL_CURATED_LEXICON[rawWord]) {
    const entry = LOCAL_CURATED_LEXICON[rawWord];
    return NextResponse.json({
      success: true,
      found: true,
      entry: {
        found: true,
        word: entry.word || rawWord,
        phonetic: entry.phonetic,
        meanings: entry.meanings || [],
        synonyms: entry.synonyms || [],
        antonyms: entry.antonyms || [],
        nuancedDistinction: entry.nuancedDistinction,
        etymology: entry.etymology,
        source: "curated_lexicon",
        isAiGenerated: false,
      },
    });
  }

  // 2. Query Free Dictionary API for authentic definitions
  try {
    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(rawWord)}`,
      {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (dictRes.ok) {
      const data = await dictRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const allMeanings: DictionaryMeaning[] = (item.meanings || []).map((m: any) => ({
          partOfSpeech: m.partOfSpeech || "noun",
          definitions: (m.definitions || []).map((d: any) => ({
            definition: d.definition,
            example: d.example,
            synonyms: d.synonyms || [],
            antonyms: d.antonyms || [],
          })),
        }));

        const allSynonyms: string[] = Array.from(
          new Set(
            allMeanings.flatMap((m) =>
              m.definitions.flatMap((d) => d.synonyms || [])
            )
          )
        ).slice(0, 8);

        const allAntonyms: string[] = Array.from(
          new Set(
            allMeanings.flatMap((m) =>
              m.definitions.flatMap((d) => d.antonyms || [])
            )
          )
        ).slice(0, 6);

        // Find audio pronunciation link
        const audioUrl = (item.phonetics || []).find((p: any) => p.audio)?.audio;

        return NextResponse.json({
          success: true,
          found: true,
          entry: {
            found: true,
            word: item.word,
            phonetic: item.phonetic || item.phonetics?.[0]?.text,
            audioUrl,
            meanings: allMeanings,
            synonyms: allSynonyms,
            antonyms: allAntonyms,
            source: "free_dictionary_api",
            isAiGenerated: false,
          },
        });
      }
    }
  } catch (err) {
    console.warn("Dictionary API fetch encountered network delay:", err);
  }

  // 3. Word not found — Fetch genuine spelling suggestions from Datamuse API
  try {
    const datamuseRes = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(rawWord)}&max=6`,
      {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(4000),
      }
    );

    if (datamuseRes.ok) {
      const suggestionsData = await datamuseRes.json();
      const suggestions: string[] = (suggestionsData || [])
        .map((s: any) => s.word?.toLowerCase())
        .filter((w: string) => w && w !== rawWord);

      return NextResponse.json({
        success: true,
        found: false,
        entry: {
          found: false,
          word: rawWord,
          meanings: [],
          synonyms: [],
          antonyms: [],
          suggestions,
          source: "spelling_service",
          isAiGenerated: false,
        },
      });
    }
  } catch (err) {
    console.warn("Datamuse spelling service error:", err);
  }

  // 4. Genuine not-found response (NEVER invent or fabricate definitions!)
  return NextResponse.json({
    success: true,
    found: false,
    entry: {
      found: false,
      word: rawWord,
      meanings: [],
      synonyms: [],
      antonyms: [],
      suggestions: [],
      source: "spelling_service",
      isAiGenerated: false,
    },
  });
}
