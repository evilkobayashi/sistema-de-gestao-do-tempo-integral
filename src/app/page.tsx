import Link from "next/link";
import {
  Building2,
  School,
  Users,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  BookOpen,
  GraduationCap
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Top Banner Navigation */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 text-lg">
              GTI
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
              GTI Educação
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                1º ao 9º Ano
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Gestão da Educação em Tempo Integral para Prefeituras</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard-executivo"
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            BI Executivo
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
          >
            <span>ENTRAR NO SISTEMA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>


      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-20">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Vibrant pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>SaaS Corporativo B2G para Secretarias Municipais de Educação</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            A Gestão de Tempo Integral na palma da mão da{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              Prefeitura
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Plataforma completa para redes públicas gerirem o Programa de Educação em Tempo Integral do{" "}
            <strong className="text-emerald-400">1º ao 9º Ano do Ensino Fundamental</strong>. Da Secretaria de Educação
            até a sala de aula: trava de 40h semanais, prevenção de conflito de turnos, importação Excel e chamada digital do oficineiro.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 hover:scale-105 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/30 transition-all flex items-center gap-3"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Abrir Painel de Gestão (Dashboard)</span>
            </Link>
            <Link
              href="/importar"
              className="px-6 py-4 bg-slate-900 border border-slate-700/80 hover:border-indigo-500 text-slate-200 hover:text-white font-semibold text-sm rounded-2xl transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Importar Planilha Excel</span>
            </Link>
          </div>
        </section>

        {/* 3-Tier Operational Architecture Cards (Colorful Gradients) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Gestão Integrada em 3 Níveis Operacionais
            </h3>
            <p className="text-xs text-slate-400">Conectando a Secretaria de Educação, as Escolas e os Oficineiros em tempo real</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level 1: SME */}
            <div className="relative group overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/50 border border-indigo-500/30 hover:border-indigo-500/60 shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">Nível 1</span>
              <h4 className="text-xl font-bold text-white mb-3">Secretaria de Educação (SME)</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>BI Macro da Rede Municipal de Ensino</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Matriz de Oficinas BNCC (1º ao 9º Ano)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Controle Orçamentário e Teto da Rede</span>
                </li>
              </ul>
            </div>

            {/* Level 2: Escolas */}
            <div className="relative group overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/50 border border-emerald-500/30 hover:border-emerald-500/60 shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block mb-1">Nível 2</span>
              <h4 className="text-xl font-bold text-white mb-3">Direção & Coordenação Escolar</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Trava Automática de 40 Horas Semanais</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Validador de Choque de Horários e Turnos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Importador XLSX & Relatórios PDF Timbrados</span>
                </li>
              </ul>
            </div>

            {/* Level 3: Oficineiros */}
            <div className="relative group overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-950/80 via-slate-900 to-orange-950/50 border border-amber-500/30 hover:border-amber-500/60 shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">Nível 3</span>
              <h4 className="text-xl font-bold text-white mb-3">Oficineiros (Sala de Aula)</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Grade de Horários Semanal em Celular/Tablet</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Lançamento Diário de Frequência dos Alunos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Diário Digital de Atividades da Oficina</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Colorful Workshop Categories Section */}
        <section className="bg-slate-900/80 rounded-3xl p-8 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Matriz de Oficinas do Ensino Fundamental (1º ao 9º Ano)
              </h3>
              <p className="text-xs text-slate-400">Eixos temáticos BNCC integrados de ponta a ponta</p>
            </div>

            {/* Status Legend Pills */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Disponível
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                No Limite (36h-40h)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Sobrecarga (&gt;40h)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 border border-emerald-500/40 text-center">
              <span className="text-xs font-bold text-emerald-300 block mb-1">Recomposição</span>
              <span className="text-[11px] text-slate-400">Alfabetização & Leitura (1º ao 3º)</span>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-900/30 border border-indigo-500/40 text-center">
              <span className="text-xs font-bold text-indigo-300 block mb-1">Matemática</span>
              <span className="text-[11px] text-slate-400">Raciocínio Lógico (1º ao 9º)</span>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-900/30 border border-cyan-500/40 text-center">
              <span className="text-xs font-bold text-cyan-300 block mb-1">Robótica & Maker</span>
              <span className="text-[11px] text-slate-400">Cultura Digital & Inovação</span>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-900/30 border border-purple-500/40 text-center">
              <span className="text-xs font-bold text-purple-300 block mb-1">Artes & Cultura</span>
              <span className="text-[11px] text-slate-400">Teatro, Música & Expressão</span>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/30 border border-amber-500/40 text-center">
              <span className="text-xs font-bold text-amber-300 block mb-1">Esportes</span>
              <span className="text-[11px] text-slate-400">Educação Física & Jogos</span>
            </div>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Dashboard BI</h4>
                <p className="text-xs text-slate-400">Métricas da Rede</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </Link>

          <Link
            href="/lotacoes"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Lotações</h4>
                <p className="text-xs text-slate-400">Validador 40h & Turnos</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          <Link
            href="/importar"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Importar Excel</h4>
                <p className="text-xs text-slate-400">Upload de Planilhas</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </Link>

          <Link
            href="/relatorios"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Relatórios PDF</h4>
                <p className="text-xs text-slate-400">Documentos Timbrados</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 GTI Educação — Gestão de Tempo Integral (1º ao 9º Ano). Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
