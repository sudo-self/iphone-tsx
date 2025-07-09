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
        url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/og.png?alt=media&token=24e476f0-8b2b-4fbb-ac33-4960b51197e5",
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
    description: "A mock iphone GUI with Supabase and Redis integration",
    images: ["https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/og.png?alt=media&token=24e476f0-8b2b-4fbb-ac33-4960b51197e5"],
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

