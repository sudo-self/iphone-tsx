import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'iphone tsx',
  description: 'A mock phone gui with supabase and redis initigration',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
