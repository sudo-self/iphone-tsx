import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iPhone TSX — Supabase & Redis integrations",
  description: "iPhone TSX featuring Supabase and Redis integration for a modern app experience.",
  generator: "v0.dev",
  metadataBase: new URL("https://iphone.jessejesse.com"),
  openGraph: {
    title: "iPhone Mock Phone GUI — Supabase & Redis Integration Demo",
    description: "A mock iPhone phone GUI featuring Supabase and Redis integration for a modern app experience.",
    url: "https://iphone.jessejesse.com",
    siteName: "iphone.jessejesse.com",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/og.png?alt=media&token=24e476f0-8b2b-4fbb-ac33-4960b51197e5",
        width: 1200,
        height: 630,
        alt: "iPhone Mock Phone GUI preview image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhone TSX — Supabase & Redis integrations",
    description: "A mock iPhone phone GUI featuring Supabase and Redis integration for a modern app experience.",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/og.png?alt=media&token=24e476f0-8b2b-4fbb-ac33-4960b51197e5",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <div className="h-full">{children}</div>
      </body>
    </html>
  );
}


