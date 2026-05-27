import type { Metadata } from "next";

import "./styles.css";

export const metadata: Metadata = {
  title: "Budget Planning Assistant",
  description: "AI-assisted budget validation workflow for Case 1.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
