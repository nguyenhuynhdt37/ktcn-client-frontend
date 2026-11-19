"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { Maximize2, Minimize2, Send, X } from "lucide-react";
import { ChatRateLimitError, chatbotService } from "../services/chatbotService";
import { safePortalHref } from "@/shared/lib/security";
import { GREETING, SUGGESTIONS, UI_TEXT } from "../data/suggestions";
import type { ChatLang, ChatMessage } from "../types";

const MAX_CHARS = 500;
/** Từ breakpoint `sm` của Tailwind trở lên khung mới có thể kéo thả; dưới đó khung chiếm gần hết chiều ngang. */
const DRAG_MIN_WIDTH = 640;
const LAUNCHER_SIZE = 56;
const DIALOG_GAP = 12;

/** setPointerCapture ném lỗi nếu con trỏ đã thả trước khi handler chạy; bỏ qua vì kéo vẫn hoạt động. */
function capturePointer(element: HTMLElement, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    /* no active pointer */
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, value), Math.max(min, max));
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
  "hover:border-brand-darkred hover:text-brand-darkred rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs! leading-snug! text-slate-700 transition-colors";

// Gợi ý câu hỏi tiếp theo: nhỏ hơn và khác tông (xanh nhạt) để không lẫn với bong bóng trả lời màu trắng.
const followUpClass =
  "rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-left text-[10px]! leading-tight! text-sky-800 transition-colors hover:border-sky-400 hover:bg-sky-100";

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
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  // null = vị trí mặc định (góc phải dưới); có giá trị khi người dùng đã kéo khung đi chỗ khác.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  // Nút tròn mở chatbot cũng kéo thả được; khung chat mở ra ngay phía trên nút ở vị trí mới.
  const [launcherPos, setLauncherPos] = useState<{ x: number; y: number } | null>(null);
  const launcherDrag = useRef<{ dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    sessionRef.current = getSessionId();
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const reset = () => {
      setPos(null);
      setLauncherPos(null);
    };
    window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, []);

  useLayoutEffect(() => {
    if (!open || !launcherPos || window.innerWidth < DRAG_MIN_WIDTH) return;
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Ưu tiên mở phía trên nút; không đủ chỗ thì mở phía dưới, vẫn không đủ thì giữ trong màn hình.
    const above = launcherPos.y - DIALOG_GAP - rect.height;
    const below = launcherPos.y + LAUNCHER_SIZE + DIALOG_GAP;
    const y = above >= 0 ? above : below + rect.height <= window.innerHeight ? below : above;
    setPos({
      x: clamp(launcherPos.x + LAUNCHER_SIZE - rect.width, 0, window.innerWidth - rect.width),
      y: clamp(y, 0, window.innerHeight - rect.height),
    });
  }, [open, expanded, launcherPos]);

  const toggleExpanded = useCallback(() => {
    setExpanded((v) => !v);
    setPos(null);
  }, []);

  const onDragStart = (e: ReactPointerEvent<HTMLElement>) => {
    if (window.innerWidth < DRAG_MIN_WIDTH || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    capturePointer(e.currentTarget, e.pointerId);
  };

  const onDragMove = (e: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const x = Math.min(Math.max(0, e.clientX - drag.dx), window.innerWidth - rect.width);
    const y = Math.min(Math.max(0, e.clientY - drag.dy), window.innerHeight - rect.height);
    setPos({ x, y });
  };

  const onDragEnd = (e: ReactPointerEvent<HTMLElement>) => {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onLauncherDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    launcherDrag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, sx: e.clientX, sy: e.clientY, moved: false };
    capturePointer(e.currentTarget, e.pointerId);
  };

  const onLauncherMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = launcherDrag.current;
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 5) return;
    drag.moved = true;
    setLauncherPos({
      x: clamp(e.clientX - drag.dx, 0, window.innerWidth - LAUNCHER_SIZE),
      y: clamp(e.clientY - drag.dy, 0, window.innerHeight - LAUNCHER_SIZE),
    });
  };

  const onLauncherUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    // Kéo xong thì nuốt cú click ngay sau đó, để thả nút không vô tình mở/đóng khung chat.
    suppressClick.current = Boolean(launcherDrag.current?.moved);
    launcherDrag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const closeDialog = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => toggleBtnRef.current?.focus());
  }, []);

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
    if (e.key === "Escape") closeDialog();
  };

  return (
    <>
      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-label={ui.title}
          style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeDialog();
          }}
          className={`fixed inset-x-3 bottom-24 z-[60] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:right-6 ${
            expanded
              ? "h-[min(85vh,780px,calc(100vh-7.5rem))] sm:w-[min(760px,calc(100vw-3rem))]"
              : "max-h-[min(70vh,560px)] sm:w-[380px]"
          }`}
        >
          <header
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            title={ui.drag}
            className="flex touch-none items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 select-none sm:cursor-move"
          >
            <Image src="/images/logo-192.png" alt="" width={36} height={36} className="size-9 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{ui.title}</p>
              <p className="truncate text-xs text-slate-500">{ui.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={toggleExpanded}
              aria-label={expanded ? ui.shrink : ui.expand}
              title={expanded ? ui.shrink : ui.expand}
              className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              {expanded ? <Minimize2 size={17} aria-hidden="true" /> : <Maximize2 size={17} aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={closeDialog}
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
                    <p className="mb-1.5 text-[11px] font-bold tracking-wide text-slate-600 uppercase">{group.group}</p>
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
                      {m.sources.map((s, i) => {
                        const safeUrl = safePortalHref(s.url, "#");
                        const external = /^https?:/i.test(safeUrl);
                        return (
                          <span key={`${s.url}-${i}`}>
                            {i > 0 && ", "}
                            {external || safeUrl === "#" ? (
                              <a
                                href={safeUrl}
                                target={external ? "_blank" : undefined}
                                rel={external ? "noopener noreferrer" : undefined}
                                className="text-brand-darkred underline"
                              >
                                {s.title}
                              </a>
                            ) : (
                              <Link href={safeUrl} className="text-brand-darkred underline">
                                {s.title}
                              </Link>
                            )}
                          </span>
                        );
                      })}
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
              <div className="mt-1 border-t border-dashed border-slate-200 pt-1.5">
                <p className="mb-1 text-[9px] font-semibold tracking-wide text-sky-700/70 uppercase">{ui.more}</p>
                <div className="flex flex-wrap gap-1">
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
        ref={toggleBtnRef}
        type="button"
        onClick={() => {
          if (suppressClick.current) return;
          setOpen((v) => !v);
        }}
        onPointerDown={onLauncherDown}
        onPointerMove={onLauncherMove}
        onPointerUp={onLauncherUp}
        onPointerCancel={onLauncherUp}
        style={launcherPos ? { left: launcherPos.x, top: launcherPos.y, right: "auto", bottom: "auto" } : undefined}
        title={ui.drag}
        aria-label={open ? ui.close : ui.open}
        aria-expanded={open}
        className="fixed right-6 bottom-6 z-50 flex size-14 touch-none items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        <Image src="/images/logo-192.png" alt="" width={44} height={44} className="size-11" />
      </button>
    </>
  );
}
