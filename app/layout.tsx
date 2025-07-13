// app/layout.tsx

import "./globals.css"
import "leaflet/dist/leaflet.css"
import type { Metadata } from "next"
import ClientSessionProvider from "@/components/ClientSessionProvider"

export const metadata: Metadata = {
  title: "iPhone TSX — Supabase & Redis DBs, Maps and Youtube APIs",
  description:
    "iPhone TSX featuring Supabase and Redis integration for a modern app experience.",
  generator: "Grok4",
  metadataBase: new URL("https://iphone.jessejesse.com"),
  openGraph: {
    title: "iPhone TSX — Supabase, Redis, Youtube, Maps, and more.",
    description:
      "An iPhone GUI featuring Supabase, Redis, Youtube, and Google Drive initigrations.",
    url: "https://iphone.jessejesse.com",
    siteName: "iphone.jessejesse.com",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/Screenshot%202025-07-11%20at%207.42.32%E2%80%AFPM.png?alt=media&token=354e2561-ffae-45b5-b54a-b678ec6a04af",
        width: 1200,
        height: 630,
        alt: "iPhone Mock Phone GUI preview image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhone TSX — Supabase, Redis, Youtube, and Google Drive",
    description:
      "An iPhone GUI featuring Supabase, Redis, Youtube, and Google Drive initigrations.",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/Screenshot%202025-07-11%20at%207.42.32%E2%80%AFPM.png?alt=media&token=354e2561-ffae-45b5-b54a-b678ec6a04af",
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-black text-white">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-full">
        <ClientSessionProvider>{children}</ClientSessionProvider>
      </body>
    </html>
  )
}






