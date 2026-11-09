import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COPD Hook Studio",
  description: "AI-powered creative studio for COPD-related short-form video hooks."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
