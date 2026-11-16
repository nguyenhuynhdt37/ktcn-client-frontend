"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { Send, X } from "lucide-react";
import { ChatRateLimitError, chatbotService } from "../services/chatbotService";
import { GREETING, SUGGESTIONS, UI_TEXT } from "../data/suggestions";
import type { ChatLang, ChatMessage } from "../types";

const MAX_CHARS = 500;
const URL_PATTERN = /((?:https?:\/\/|\/(?:vi|en)\/)[^\s)]+)/g;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function getSessionId(): string {
  try {
    const saved = window.sessionStorage.getItem("chatbot-session");
    if (saved) return saved;
    const created = newId();
    window.sessionStorage.setItem("chatbot-session", created);
    return created;
  } catch {
    return newId();
  }
}

/** Biến URL trong văn bản thành liên kết; không render HTML thô. */
function renderText(text: string): ReactNode[] {
  return text.split(URL_PATTERN).map((part, index) => {
    if (index % 2 === 0) return part;
    const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const href = trailing ? part.slice(0, -trailing.length) : part;
    const external = href.startsWith("http");
    return (
      <span key={index}>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-darkred underline break-all">
            {href}
          </a>
        ) : (
          <Link href={href} className="text-brand-darkred underline break-all">
            {href}
          </Link>
        )}
        {trailing}
      </span>
    );
  });
}

const chipClass =
  "hover:border-brand-darkred hover:text-brand-darkred rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs text-slate-700 transition-colors";

// Gợi ý câu hỏi tiếp theo: nhỏ hơn và khác tông (xanh nhạt) để không lẫn với bong bóng trả lời màu trắng.
const followUpClass =
  "rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-left text-[11px] leading-snug text-sky-800 transition-colors hover:border-sky-400 hover:bg-sky-100";

export function ChatWidget() {
  const locale = useLocale();
  const lang: ChatLang = locale === "en" ? "en" : "vi";
  const ui = UI_TEXT[lang];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<string>("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    sessionRef.current = getSessionId();
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, pending, open]);

  const asked = useMemo(() => new Set(messages.filter((m) => m.role === "user").map((m) => m.text)), [messages]);
  const followUps = useMemo(
    () =>
      SUGGESTIONS[lang]
        .flatMap((g) => g.questions)
        .filter((q) => !asked.has(q))
        .slice(0, 3),
    [lang, asked],
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_CHARS);
      if (!text || pending) return;
      setError(null);
      setInput("");
      setMessages((prev) => [...prev, { id: newId(), role: "user", text }]);
      setPending(true);
      try {
        const reply = await chatbotService.send({ sessionId: sessionRef.current || getSessionId(), message: text, lang });
        setMessages((prev) => [...prev, { id: newId(), role: "bot", text: reply.answer, sources: reply.sources }]);
      } catch (e) {
        setError(e instanceof ChatRateLimitError ? ui.rate : ui.network);
      } finally {
        setPending(false);
      }
    },
    [lang, pending, ui.network, ui.rate],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={ui.title}
          className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[380px]"
        >
          <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
            <Image src="/images/logo-192.png" alt="" width={36} height={36} className="size-9 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{ui.title}</p>
              <p className="truncate text-xs text-slate-500">{ui.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={ui.close}
              className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm">
              {GREETING[lang]}
            </div>

            {messages.length === 0 && (
              <div className="space-y-3">
                {SUGGESTIONS[lang].map((group) => (
                  <div key={group.group}>
                    <p className="mb-1.5 text-[11px] font-bold tracking-wide text-slate-400 uppercase">{group.group}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.questions.map((q) => (
                        <button key={q} type="button" onClick={() => void send(q)} className={chipClass}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {messages.map((m) =>
              m.role === "user" ? (
                <div
                  key={m.id}
                  className="bg-brand-darkred ml-auto max-w-[88%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm break-words whitespace-pre-wrap text-white"
                >
                  {m.text}
                </div>
              ) : (
                <div
                  key={m.id}
                  className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm break-words whitespace-pre-wrap text-slate-800 shadow-sm"
                >
                  {renderText(m.text)}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
                      <span className="font-semibold">{ui.sources}: </span>
                      {m.sources.map((s, i) => (
                        <span key={s.url}>
                          {i > 0 && ", "}
                          <Link href={s.url} className="text-brand-darkred underline">
                            {s.title}
                          </Link>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}

            {pending && (
              <div className="max-w-[88%] rounded-2xl bg-white px-3.5 py-2.5 text-sm text-slate-500 shadow-sm">{ui.thinking}</div>
            )}
            {error && (
              <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {messages.length > 0 && !pending && followUps.length > 0 && (
              <div className="mt-1 border-t border-dashed border-slate-200 pt-2.5">
                <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-sky-700/70 uppercase">{ui.more}</p>
                <div className="flex flex-wrap gap-1.5">
                  {followUps.map((q) => (
                    <button key={q} type="button" onClick={() => void send(q)} className={followUpClass}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-slate-100 bg-white p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={MAX_CHARS}
              rows={1}
              placeholder={ui.placeholder}
              aria-label={ui.placeholder}
              className="focus:border-brand-darkred max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label={ui.send}
              className="bg-brand-darkred inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? ui.close : ui.open}
        aria-expanded={open}
        className="fixed right-6 bottom-6 z-50 flex size-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        <Image src="/images/logo-192.png" alt="" width={44} height={44} className="size-11" />
      </button>
    </>
  );
}
