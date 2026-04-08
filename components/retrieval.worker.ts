import { pipeline } from "@xenova/transformers";

type RawChunk = {
  chunk_id?: string;
  section_id?: string;
  section_title?: string;
  section_type?: string;
  text: string;
  tags?: string[];
  embedding_tags?: string[];
  cited_works?: string[];
  embedding?: number[];
};

type IndexedChunk = {
  id: string;
  sectionTitle: string;
  sectionType: string;
  text: string;
  tags: string[];
  citedWorks: string[];
  embedding: number[];
  score?: number;
};

type InitMessage = {
  type: "init";
  payload: {
    chunks: RawChunk[];
  };
};

type SearchMessage = {
  type: "search";
  payload: {
    query: string;
    topK?: number;
  };
};

type WorkerMessage = InitMessage | SearchMessage;

let embedderPromise: Promise<Awaited<ReturnType<typeof pipeline>>> | null = null;
let knowledgeBase: IndexedChunk[] = [];
let modelStatus: "idle" | "loading" | "ready" | "failed" = "idle";

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function getEmbedder() {
  if (!embedderPromise) {
    modelStatus = "loading";
    embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
      .then((instance) => {
        modelStatus = "ready";
        self.postMessage({
          type: "status",
          payload: {
            phase: "semantic-model-ready",
            progress: 1,
          },
        });
        return instance;
      })
      .catch((error) => {
        modelStatus = "failed";
        throw error;
      });
  }
  return embedderPromise;
}

async function embedText(text: string) {
  const embedder = await getEmbedder();
  const extractor = embedder as unknown as (
    input: string,
    options: { pooling: "mean"; normalize: boolean },
  ) => Promise<{ data: Float32Array }>;
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data as Float32Array);
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function lexicalScore(query: string, chunk: IndexedChunk) {
  const queryTokens = tokenize(query);
  const textTokens = new Set(tokenize(chunk.text));
  const tagTokens = new Set(chunk.tags.flatMap((tag) => tokenize(tag)));

  let score = 0;
  for (const token of queryTokens) {
    if (textTokens.has(token)) {
      score += 1;
    }
    if (tagTokens.has(token)) {
      score += 1.5;
    }
    if (chunk.sectionTitle.toLowerCase().includes(token)) {
      score += 1.2;
    }
  }

  return queryTokens.length ? score / queryTokens.length : 0;
}

function normalizeChunks(chunks: RawChunk[]) {
  return chunks
    .filter((chunk) => chunk.text?.trim())
    .map((chunk, index) => ({
      id: chunk.chunk_id ?? chunk.section_id ?? `chunk-${index}`,
      sectionTitle: chunk.section_title ?? "Research Section",
      sectionType: chunk.section_type ?? "knowledge",
      text: chunk.text.trim(),
      tags: chunk.tags ?? chunk.embedding_tags ?? [],
      citedWorks: chunk.cited_works ?? [],
      embedding: chunk.embedding ?? [],
    }));
}

function summarizeMatches(matches: IndexedChunk[]) {
  const best = matches[0];
  if (!best) {
    return "I could not find a confident match in the local research knowledge base.";
  }

  const supporting = matches[1]?.text ? ` ${matches[1].text}` : "";
  return `${best.text}${supporting}`;
}

function respond(query: string, matches: IndexedChunk[], mode: "lexical" | "hybrid" | "semantic") {
  const citations = Array.from(
    new Set(matches.flatMap((match) => match.citedWorks).filter(Boolean)),
  ).slice(0, 3);

  self.postMessage({
    type: "result",
    payload: {
      mode,
      answer: summarizeMatches(matches),
      citations,
      matches,
      query,
    },
  });
}

function searchLexically(query: string, topK = 3) {
  return knowledgeBase
    .map((chunk) => ({
      ...chunk,
      score: lexicalScore(query, chunk),
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, topK);
}

async function enrichSemantically(query: string, candidates: IndexedChunk[], topK = 3) {
  const queryEmbedding = await embedText(query);

  const enriched = await Promise.all(
    candidates.map(async (chunk) => {
      let embedding = chunk.embedding;
      if (embedding.length === 0) {
        embedding = await embedText(chunk.text);
        const target = knowledgeBase.find((item) => item.id === chunk.id);
        if (target) {
          target.embedding = embedding;
        }
      }

      const semantic = cosineSimilarity(queryEmbedding, embedding);
      const lexical = lexicalScore(query, chunk);
      return {
        ...chunk,
        embedding,
        score: semantic * 0.75 + lexical * 0.25,
      };
    }),
  );

  return enriched.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, topK);
}

async function initialize(chunks: RawChunk[]) {
  knowledgeBase = normalizeChunks(chunks);

  self.postMessage({
    type: "ready",
    payload: {
      chunks: knowledgeBase,
      hasPrecomputedEmbeddings: knowledgeBase.some((chunk) => chunk.embedding.length > 0),
    },
  });

  void getEmbedder().catch((error) => {
    self.postMessage({
      type: "status",
      payload: {
        phase: error instanceof Error ? error.message : "semantic-model-failed",
        progress: 1,
      },
    });
  });
}

async function search(query: string, topK = 3) {
  const lexicalMatches = searchLexically(query, Math.max(topK, 5));

  if (lexicalMatches.length === 0) {
    respond(query, [], "lexical");
    return;
  }

  if (modelStatus !== "ready") {
    respond(query, lexicalMatches.slice(0, topK), "lexical");
    return;
  }

  const hybridMatches = await enrichSemantically(query, lexicalMatches, topK);
  respond(query, hybridMatches, "hybrid");
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { data } = event;

  if (data.type === "init") {
    try {
      await initialize(data.payload.chunks);
    } catch (error) {
      self.postMessage({
        type: "error",
        payload: {
          message: error instanceof Error ? error.message : "Failed to initialize local AI.",
        },
      });
    }
    return;
  }

  if (data.type === "search") {
    try {
      await search(data.payload.query, data.payload.topK);
    } catch (error) {
      self.postMessage({
        type: "error",
        payload: {
          message: error instanceof Error ? error.message : "Failed to search the local knowledge base.",
        },
      });
    }
  }
};
