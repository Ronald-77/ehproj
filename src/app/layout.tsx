import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UIT CTF Platform",
  description: "UIT CTF Platform UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white" suppressHydrationWarning>{children}</body>
    </html>
  );
}
