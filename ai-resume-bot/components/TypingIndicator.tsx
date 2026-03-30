export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex gap-[5px] items-center px-4 py-3
                      bg-[#f7f6ff] border border-[#ede9ff]
                      rounded-[18px_18px_18px_4px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot w-[7px] h-[7px] rounded-full
                       bg-gradient-to-br from-[#9b8eff] to-[#d860b0]"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
