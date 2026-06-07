import type {Metadata, Viewport} from 'next'
import {Poppins} from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'GRM Citizen — Demo',
  description:
    'Grievance Redress Mechanism citizen app — web demo connected to the GRM Benin platform.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#24c38b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} antialiased`}>
      <body style={{fontFamily: 'var(--font-poppins), system-ui, sans-serif'}}>
        {children}
      </body>
    </html>
  )
}
