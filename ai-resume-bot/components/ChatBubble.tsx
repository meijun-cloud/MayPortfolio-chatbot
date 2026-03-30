interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}>
      <div
        className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? "bg-gradient-to-br from-[#9b8eff] to-[#7c5ce7] text-white rounded-[18px_18px_4px_18px]"
            : "bg-[#f7f6ff] border border-[#ede9ff] text-gray-700 rounded-[18px_18px_18px_4px]"
          }`}
      >
        {content}
      </div>
    </div>
  );
}
