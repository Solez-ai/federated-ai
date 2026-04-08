"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, SendHorizontal, Sparkles, User2 } from "lucide-react";
import researchEmbedding from "@/app/research_proposal_embedding.json";

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

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  source?: IndexedChunk;
  confidence?: number;
  citations?: string[];
  pending?: boolean;
  mode?: "lexical" | "hybrid" | "semantic";
};

type WorkerOutgoing =
  | { type: "status"; payload: { phase: string; progress: number } }
  | { type: "ready"; payload: { chunks: IndexedChunk[]; hasPrecomputedEmbeddings: boolean } }
  | {
      type: "result";
      payload: {
        mode: "lexical" | "hybrid" | "semantic";
        answer: string;
        citations: string[];
        matches: IndexedChunk[];
        query: string;
      };
    }
  | { type: "error"; payload: { message: string } };

const THINKING_STATES = [
  "Analyzing research nodes...",
  "Matching semantic vectors...",
  "Retrieving local knowledge...",
];

function clampConfidence(score: number) {
  return Math.max(52, Math.min(99, Math.round(score * 100)));
}

export default function AISection() {
  const workerRef = useRef<Worker | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pendingMessageIdRef = useRef<string | null>(null);
  const pendingQueryRef = useRef<string>("");
  const requestTimeoutRef = useRef<number | null>(null);
  const resolvedRequestIdsRef = useRef<Set<string>>(new Set());
  const [prompt, setPrompt] = useState("");
  const [thinkingLabel, setThinkingLabel] = useState(THINKING_STATES[0]);
  const [progress, setProgress] = useState(0.05);
  const [ready, setReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchMode, setSearchMode] = useState<"booting" | "lexical" | "hybrid" | "semantic">("booting");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I am running fully inside your browser. Ask about federated learning, privacy trade-offs, personalization, secure aggregation, datasets, or the project timeline.",
    },
  ]);

  const rawChunks = useMemo(
    () =>
      ((researchEmbedding as { embedding_ready_chunks?: RawChunk[] }).embedding_ready_chunks ??
        []) as RawChunk[],
    [],
  );

  const normalizedChunks = useMemo<IndexedChunk[]>(
    () =>
      rawChunks.map((chunk, index) => ({
        id: chunk.chunk_id ?? chunk.section_id ?? `chunk-${index}`,
        sectionTitle: chunk.section_title ?? "Research Section",
        sectionType: chunk.section_type ?? "knowledge",
        text: chunk.text.trim(),
        tags: chunk.tags ?? chunk.embedding_tags ?? [],
        citedWorks: chunk.cited_works ?? [],
        embedding: chunk.embedding ?? [],
      })),
    [rawChunks],
  );

  const tokenize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1);

  const localFallbackSearch = useCallback((query: string) => {
    const queryTokens = tokenize(query);
    const matches = normalizedChunks
      .map((chunk) => {
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

        return {
          ...chunk,
          score: queryTokens.length ? score / queryTokens.length : 0,
        };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3);

    const answer = matches[0]
      ? `${matches[0].text}${matches[1]?.text ? ` ${matches[1].text}` : ""}`
      : "I could not find a confident match in the local research knowledge base.";

    return {
      answer,
      matches,
      citations: Array.from(new Set(matches.flatMap((match) => match.citedWorks).filter(Boolean))).slice(0, 3),
      mode: "lexical" as const,
    };
  }, [normalizedChunks]);

  const applyAssistantResult = (
    messageId: string,
    result: {
      answer: string;
      matches: IndexedChunk[];
      citations: string[];
      mode: "lexical" | "hybrid" | "semantic";
    },
  ) => {
    if (resolvedRequestIdsRef.current.has(messageId)) {
      return;
    }
    resolvedRequestIdsRef.current.add(messageId);
    setIsSending(false);
    setSearchMode(result.mode);

    const topMatch = result.matches[0];
    const confidence = topMatch?.score ? clampConfidence(topMatch.score) : undefined;
    let index = 0;
    const typingInterval = window.setInterval(() => {
      index += 14;

      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: result.answer.slice(0, index),
                source: topMatch,
                confidence,
                citations: result.citations,
                mode: result.mode,
                pending: index < result.answer.length,
              }
            : message,
        ),
      );

      if (index >= result.answer.length) {
        window.clearInterval(typingInterval);
      }
    }, 22);
  };

  useEffect(() => {
    const worker = new Worker(new URL("./retrieval.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerOutgoing>) => {
      const data = event.data;

      if (data.type === "status") {
        setProgress(data.payload.progress);
        return;
      }

      if (data.type === "ready") {
        setProgress(data.payload.hasPrecomputedEmbeddings ? 0.92 : 0.7);
        setReady(true);
        return;
      }

      if (data.type === "error") {
        const targetMessageId = pendingMessageIdRef.current;
        if (targetMessageId) {
          applyAssistantResult(targetMessageId, {
            ...localFallbackSearch(pendingQueryRef.current),
            answer: `${data.payload.message} Falling back to local retrieval.`,
          });
        }
        return;
      }

      if (data.type === "result") {
        const targetMessageId = pendingMessageIdRef.current;
        if (!targetMessageId) {
          return;
        }
        if (requestTimeoutRef.current) {
          window.clearTimeout(requestTimeoutRef.current);
          requestTimeoutRef.current = null;
        }
        applyAssistantResult(targetMessageId, {
          answer: data.payload.answer,
          matches: data.payload.matches,
          citations: data.payload.citations,
          mode: data.payload.mode,
        });
      }
    };

    worker.postMessage({
      type: "init",
      payload: {
        chunks: rawChunks,
      },
    });

    return () => {
      if (requestTimeoutRef.current) {
        window.clearTimeout(requestTimeoutRef.current);
      }
      worker.terminate();
    };
  }, [localFallbackSearch, rawChunks]);

  useEffect(() => {
    if (ready) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setThinkingLabel((current) => {
        const currentIndex = THINKING_STATES.indexOf(current);
        return THINKING_STATES[(currentIndex + 1) % THINKING_STATES.length];
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [ready]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const submitQuery = (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return;
    }

    const requestId = `${Date.now()}`;
    const assistantId = `assistant-${requestId}`;
    resolvedRequestIdsRef.current.delete(assistantId);
    pendingMessageIdRef.current = assistantId;
    pendingQueryRef.current = cleanQuery;

    setMessages((current) => [
      ...current,
      { id: `user-${requestId}`, role: "user", content: cleanQuery },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        pending: true,
      },
    ]);

    if (!workerRef.current) {
      return;
    }

    setIsSending(true);
    requestTimeoutRef.current = window.setTimeout(() => {
      applyAssistantResult(assistantId, localFallbackSearch(cleanQuery));
    }, 1800);

    window.setTimeout(() => {
      workerRef.current?.postMessage({
        type: "search",
        payload: {
          query: cleanQuery,
          topK: 3,
        },
      });
    }, 600);
  };

  const sendPrompt = (event?: FormEvent) => {
    event?.preventDefault();
    if (isSending) {
      return;
    }
    const query = prompt.trim();
    if (!query) {
      return;
    }
    setPrompt("");
    submitQuery(query);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendPrompt();
    }
  };

  return (
    <section
      id="ai"
      className="relative overflow-hidden border-t border-white/5 bg-[#02040a] px-4 py-20 sm:px-6 lg:px-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-5%] h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-[-5%] h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(circle at center, black 45%, transparent 85%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.28em] text-cyan-100/70">
                <Sparkles className="h-3.5 w-3.5" />
                Samin&apos;s Research AI
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/14 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-amber-100/90">
                <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.85)]" />
                Beta
              </div>
            </div>
            <h2
              className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-orbitron), monospace" }}
            >
              Samin&apos;s Research AI
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/58 sm:text-lg">
              Semantic retrieval over the proposal, fully client-side. No server inference, no external API calls, just the paper and a local embedder running in your browser.
            </p>
            <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-50/92 shadow-[0_0_24px_rgba(251,191,36,0.08)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-200/90">
                Warning
              </span>
              <p className="mt-2">
                This is a paper-grounded research assistant, not a full general AI. It only searches and reformats information from this project&apos;s local knowledge base, and its answers should be treated as guided summaries of the proposal.
              </p>
            </div>
          </div>

          <div className="glass-panel w-full max-w-md rounded-[28px] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/35">Engine</p>
                <p className="mt-1 text-sm font-semibold text-white">Xenova/all-MiniLM-L6-v2</p>
              </div>
              <div className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-cyan-100/80">
                {ready ? "Live" : "Booting"}
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400"
                animate={{ width: `${Math.max(progress * 100, 8)}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-mono uppercase tracking-[0.18em] text-white/35">
              {ready ? `Search mode: ${searchMode === "booting" ? "lexical" : searchMode}` : thinkingLabel}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_340px]">
          <div
            className="glass-panel relative overflow-hidden rounded-[32px] border border-white/10"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,15,24,0.94) 0%, rgba(3,4,10,0.92) 100%)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Samin&apos;s Research AI</p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/32">
                    Beta research retrieval system
                  </p>
                </div>
              </div>
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 sm:block">
                Multi-turn chat enabled
              </div>
            </div>

            <div ref={listRef} className="flex max-h-[720px] min-h-[560px] flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-[28px] p-4 sm:max-w-[80%] sm:p-5 ${
                        message.role === "user"
                          ? "border border-cyan-300/20 bg-cyan-300/12 text-white"
                          : "border border-white/8 bg-white/[0.035] text-white/80"
                      }`}
                    >
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">
                        {message.role === "user" ? <User2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5 text-cyan-200" />}
                        {message.role === "user" ? "Researcher" : "Assistant"}
                      </div>

                      {message.pending && !message.content ? (
                        <div className="space-y-3">
                          <p className="text-sm text-cyan-100/75">{thinkingLabel}</p>
                          <div className="flex gap-2">
                            {[0, 1, 2].map((dot) => (
                              <motion.span
                                key={dot}
                                className="h-2.5 w-2.5 rounded-full bg-cyan-200/80"
                                animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                                transition={{ duration: 0.85, repeat: Infinity, delay: dot * 0.12 }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</p>
                      )}

                      {message.source && !message.pending && (
                        <div className="mt-4 rounded-2xl border border-cyan-300/12 bg-cyan-300/6 p-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-100/65">
                              Source: {message.source.sectionTitle}
                            </span>
                            {message.mode && (
                              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-100/75">
                                Mode: {message.mode}
                              </span>
                            )}
                            {typeof message.confidence === "number" && (
                              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-100/80">
                                Confidence: {message.confidence}%
                              </span>
                            )}
                          </div>
                          <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/58">{message.source.text}</p>
                          {message.source.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.source.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-white/38"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <form onSubmit={sendPrompt} className="border-t border-white/8 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-end gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-2">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  rows={1}
                  placeholder="Ask how aggregation works, what epsilon changes, or which datasets are used..."
                  className="max-h-36 min-h-[52px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                />
                <motion.button
                  type="button"
                  onClick={() => sendPrompt()}
                  whileHover={{ scale: prompt.trim() && !isSending ? 1.04 : 1 }}
                  whileTap={{ scale: prompt.trim() && !isSending ? 0.96 : 1 }}
                  disabled={!prompt.trim() || isSending}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/12 text-cyan-100 transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <SendHorizontal className="h-4 w-4" />
                </motion.button>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-5">
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-white/35">Thinking State</p>
              <p className="mt-3 text-xl font-semibold text-white">
                {ready ? "Answers immediately, improves semantically when ready" : thinkingLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/52">
                The assistant now falls back to lexical retrieval instantly, then uses semantic similarity when the local model is available.
              </p>
            </div>

            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-white/35">Suggested Queries</p>
              <div className="mt-4 flex flex-col gap-2.5">
                {[
                  "How does secure aggregation protect hospital updates?",
                  "What is the privacy versus accuracy trade-off in this proposal?",
                  "Which datasets and model architectures are planned?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setPrompt(suggestion)}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/72 transition hover:border-cyan-300/18 hover:bg-cyan-300/8 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-white/35">System Notes</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/54">
                <li>Runs locally with `@xenova/transformers` and a Web Worker.</li>
                <li>Answers immediately using lexical retrieval if embeddings are not ready yet.</li>
                <li>Uses the proposal JSON as the knowledge source for every answer.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
