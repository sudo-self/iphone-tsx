import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "iphone tsx",
  description: "A mock phone gui with supabase and redis integration",
  generator: "v0.dev",
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

