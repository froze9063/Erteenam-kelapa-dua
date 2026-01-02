import '../styles/global.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RT Digital',
  description: 'Platform transparansi dan informasi RT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  )
}
