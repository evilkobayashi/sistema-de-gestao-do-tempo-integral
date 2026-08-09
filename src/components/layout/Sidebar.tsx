'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  LayoutDashboard,
  ClipboardPlus,
  Users,
  School,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Settings,
  LogOut,
  Upload,
  Sparkles,
  BarChart3,
  UserCheck
} from 'lucide-react'


import { logoutAction } from '@/app/actions/auth'

const links = [
  { href: '/', label: 'Início (Home)', icon: Home },
  { href: '/dashboard-executivo', label: 'Dashboard BI Executivo', icon: BarChart3 },
  { href: '/dashboard', label: 'Dashboard Operacional', icon: LayoutDashboard },
  { href: '/frequencia', label: 'Frequência & Evasão', icon: UserCheck },
  { href: '/lotacoes', label: 'Lotações & Trava 40h', icon: ClipboardPlus },
  { href: '/importar', label: 'Importar Excel', icon: Upload },
  { href: '/oficineiros', label: 'Oficineiros', icon: Users },
  { href: '/escolas', label: 'Escolas', icon: School },
  { href: '/resumo-escolas', label: 'Resumo por Escola', icon: FileBarChart2 },
  { href: '/resumo-oficineiros', label: 'Resumo por Oficineiro', icon: FileSpreadsheet },
  { href: '/relatorios', label: 'Relatórios PDF', icon: FileText },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col shadow-2xl border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 text-sm">
              GTI
            </div>
          </div>
          <div>
            <div className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              GTI Educação
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Tempo Integral (1º ao 9º)</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Status Legend Box */}
      <div className="p-3 mx-2 my-2 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status da Carga (40h)</span>
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Disponível
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            No Limite
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
            Sobrecarga
          </span>
        </div>
      </div>

      {/* User Logout */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-slate-400 hover:text-white transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            SME
          </div>
          <span className="text-xs font-semibold text-slate-300">Gestão da Rede</span>
        </div>
        <button
          onClick={() => logoutAction()}
          title="Sair do Sistema"
          className="p-1 rounded-md hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

