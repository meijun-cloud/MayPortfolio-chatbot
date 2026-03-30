import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "May Chen — AI Resume Bot",
  description: "Ask anything about May's experience, projects, and skills.",
  openGraph: {
    title: "May Chen — AI Resume Bot",
    description: "Interactive AI-powered portfolio chatbot",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
