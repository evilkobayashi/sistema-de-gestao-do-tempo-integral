import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GTI Educação – Gestão de Tempo Integral (1º ao 9º Ano)',
  description: 'Plataforma SaaS B2G para Secretarias Municipais de Educação e Prefeituras. Alocação de oficineiros, relatórios timbrados e controle da Trava 40h.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-slate-950 text-slate-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
