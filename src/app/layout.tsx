import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from './providers/WalletProvider'
import { JupiterProvider } from './providers/JupiterProvider'
import '@solana/wallet-adapter-react-ui/styles.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crypto Payment Gateway',
  description: 'Accept crypto payments and settle in USDC using Jupiter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <JupiterProvider>
            {children}
          </JupiterProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
} 