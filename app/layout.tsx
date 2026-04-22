import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GameProvider } from "@/lib/game-context"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Pontinho",
  description: "Sistema do jogo Pontinho",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  )
}