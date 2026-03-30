"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import PromptCard from "@/components/PromptCard";
import ChatBubble from "@/components/ChatBubble";
import TypingIndicator from "@/components/TypingIndicator";

// ─── 型別 ─────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ─── 提示卡片資料（依自身背景修改）──────────────────────────
const PROMPT_SETS = [
  [
    {
      text: "Tell me about May's work experience",
      icon: <BriefcaseIcon />,
    },
    {
      text: "What projects has she built?",
      icon: <ProjectIcon />,
    },
    {
      text: "What are her design & tech skills?",
      icon: <SkillIcon />,
    },
    {
      text: "How can I collaborate with her?",
      icon: <ChatIcon />,
    },
  ],
  [
    {
      text: "What's May's educational background?",
      icon: <SchoolIcon />,
    },
    {
      text: "Has she worked with international clients?",
      icon: <GlobeIcon />,
    },
    {
      text: "What tools does she use daily?",
      icon: <ToolIcon />,
    },
    {
      text: "What's her biggest career achievement?",
      icon: <StarIcon />,
    },
  ],
];

// ─── 主元件 ───────────────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [promptSet, setPromptSet] = useState(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isChatting = messages.length > 0;
  const charCount = input.length;

  // 自動捲到底部
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 自動調整 textarea 高度
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(err.error ?? "Request failed");
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content },
        ]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Sorry, I ran into an issue: ${msg}` },
        ]);
      } finally {
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const refreshPrompts = () => {
    setPromptSet((prev) => (prev + 1) % PROMPT_SETS.length);
  };

  const cards = PROMPT_SETS[promptSet];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── TopBar ── */}
      <header className="bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 py-3 z-10">
        <div className="flex items-center gap-3">
          {/* Logo badge */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9b8eff] to-[#d860b0] flex items-center justify-center text-white font-bold text-sm select-none">
            M
          </div>
          <span className="font-semibold text-gray-800 text-sm">May&apos;s Portfolio</span>
        </div>

        <nav className="hidden md:flex gap-8">
          {["作品", "經歷", "聯絡"].map((item) => (
            <a key={item} href="#" className="text-sm text-gray-400 hover:text-purple-500 transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <span className="text-xs text-gray-300 hidden sm:block">AI Resume Bot</span>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* ── Welcome Section (隱藏於聊天開始後) ── */}
        {!isChatting && (
          <section className="flex-1 flex flex-col animate-fade-in">
            {/* 標題 */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Hi, I&apos;m{" "}
                <span className="gradient-text">May Chen</span>
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mt-1">
                What would you like to know?
              </h2>
              <p className="text-gray-400 text-sm mt-3">
                Use one of the most common prompts below or use your own to begin
              </p>
            </div>

            {/* Prompt cards — 2×2 grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {cards.map((c) => (
                <PromptCard
                  key={c.text}
                  text={c.text}
                  icon={c.icon}
                  onClick={sendMessage}
                />
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={refreshPrompts}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-500 transition-colors mb-8 w-fit"
            >
              <RefreshIcon />
              Refresh Prompts
            </button>
          </section>
        )}

        {/* ── Chat History ── */}
        {isChatting && (
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scroll pb-4 min-h-0">
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={chatBottomRef} />
          </div>
        )}

        {/* ── Input Box ── */}
        <div className="mt-auto pt-4">
          <div className="relative input-halo">
            <div className="relative z-[1] bg-white border border-gray-200 rounded-2xl px-4 pt-4 pb-3 shadow-sm">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask whatever you want...."
                disabled={isLoading}
                rows={1}
                className="w-full resize-none bg-transparent text-sm text-gray-700
                           placeholder:text-gray-300 outline-none leading-relaxed
                           min-h-[28px] max-h-[160px] mb-8"
              />

              {/* Bottom bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5 text-gray-300">
                  {/* 附件按鈕（預留，可擴充） */}
                  <button className="flex items-center gap-1.5 text-xs hover:text-purple-400 transition-colors">
                    <AttachIcon />
                    Add Attachment
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-300">
                    {charCount}/1000
                  </span>
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={isLoading || charCount === 0}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9b8eff] to-[#7c5ce7]
                               flex items-center justify-center text-white
                               disabled:opacity-40 disabled:cursor-not-allowed
                               hover:opacity-90 transition-opacity"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-300 mt-3">
            AI may make mistakes. Always verify important information.
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── SVG Icon 元件 ────────────────────────────────────────────
function BriefcaseIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-gray-400 group-hover:stroke-purple-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}
function ProjectIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-gray-400 group-hover:stroke-purple-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20M5 20V8l7-5 7 5v12" /><rect x="9" y="14" width="6" height="6" />
    </svg>
  );
}
function SkillIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-gray-400 group-hover:stroke-purple-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a15 15 0 010 20M2 12h20" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-gray-400 group-hover:stroke-purple-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function SchoolIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-gray-400 group-hover:stroke-purple-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10l-10-7L2 10l10 7 10-7z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-gray-400 group-hover:stroke-purple-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 010 20M2 12h20" />
    </svg>
  );
}
function ToolIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-gray-400 group-hover:stroke-purple-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-gray-400 group-hover:stroke-purple-400" viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M4 4v5h5M20 20v-5h-5M20 9A9 9 0 006 4.3M4 15a9 9 0 0014 4.7" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function AttachIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
