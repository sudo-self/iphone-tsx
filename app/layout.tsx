import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "iphone tsx",
  description: "A mock phone GUI with Supabase and Redis integration",
  generator: "v0.dev",
  metadataBase: new URL("https://iphone.jessejesse.com"),
  openGraph: {
    title: "iphone tsx",
    description: "A mock phone GUI with Supabase and Redis integration",
    url: "https://iphone.jessejesse.com",
    siteName: "iphone.jessejesse.com",
    images: [
      {
        url: "https://iphone.jessejesse.com/og.png",
        width: 1200,
        height: 630,
        alt: "iphone tsx preview image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "iphone tsx",
    description: "A mock phone GUI with Supabase and Redis integration",
    images: ["https://iphone.jessejesse.com/og.png"],
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <div className="h-full">{children}</div>
      </body>
    </html>
  )
}

