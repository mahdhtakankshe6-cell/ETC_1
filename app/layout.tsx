import type React from "react"
import type { Metadata } from "next"
import { Archivo, Noto_Sans_SC } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { I18nProvider } from "@/components/i18n-provider"
import { Web3Provider } from "@/components/web3-provider"
import "./globals.css"

const archivo = Archivo({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-archivo',
  display: 'swap',
  preload: true
})

const notoSansSC = Noto_Sans_SC({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: '--font-noto-sans-sc',
  display: 'swap',
  preload: true
})

export const metadata: Metadata = {
  title: "Eternal Code",
  description: "購買節點獲得VETC獎勵",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${archivo.variable} ${notoSansSC.variable} antialiased`} style={{ fontFamily: 'var(--font-archivo), var(--font-noto-sans-sc), sans-serif' }}>
        <Web3Provider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
