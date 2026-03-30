import React from "react";

interface PromptCardProps {
  text: string;
  icon: React.ReactNode;
  onClick: (text: string) => void;
}

export default function PromptCard({ text, icon, onClick }: PromptCardProps) {
  return (
    <button
      onClick={() => onClick(text)}
      className="group flex flex-col justify-between bg-white border border-gray-100 rounded-2xl p-4
                 text-left cursor-pointer transition-all duration-150
                 hover:border-purple-300 hover:shadow-sm hover:shadow-purple-50
                 focus:outline-none focus:ring-2 focus:ring-purple-300"
    >
      <p className="text-sm text-gray-700 font-medium leading-snug mb-5">{text}</p>
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center
                      group-hover:bg-purple-50 transition-colors">
        {icon}
      </div>
    </button>
  );
}
