import Link from 'next/link'
import { FileDown, Sparkles, Home, BarChart3 } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            GTI Educação <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">— Tempo Integral</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1">
            Rede Pública de Ensino (1º ao 9º Ano)
            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
          </p>
        </div>
      </div>

        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all font-semibold flex items-center gap-1.5"
            >
              <Home size={14} className="text-indigo-400" />
              <span>Início</span>
            </Link>
            <Link
              href="/dashboard-executivo"
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all font-semibold flex items-center gap-1.5"
            >
              <BarChart3 size={14} className="text-emerald-400" />
              <span>BI Executivo</span>
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all font-semibold flex items-center gap-1.5"
            >
              <span>Login</span>
            </Link>
          </nav>

          <Link
            href="/relatorios"
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center gap-2"
          >
            <FileDown size={15} />
            <span>RELATÓRIOS PDF TIMBRADOS</span>
          </Link>
        </div>

    </header>
  )
}
