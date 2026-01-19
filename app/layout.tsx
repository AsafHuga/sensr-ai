import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Jury AI - Premium PM Interview Practice",
  description: "Get expert-level feedback from AI interviewers. Practice PM interviews with real-time evaluation and detailed insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
