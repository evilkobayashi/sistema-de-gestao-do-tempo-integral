'use client'

import { useState, useMemo } from 'react'
import {
  UserCheck,
  UserX,
  AlertTriangle,
  Calendar,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  School,
  BookOpen,
  Users,
  Sparkles,
  TrendingUp,
  Filter,
  Save,
  Check
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface EscolaOption {
  id: number
  nome: string
}

interface OficinaOption {
  id: number
  nome: string
}

interface AlunoFrequencia {
  id: number
  nome: string
  matricula: string
  turma: string
  escolaId: number
  oficinaId: number
  historicoPresenca: number // percentual Ex: 88%
  statusHoje: 'presente' | 'falta' | 'justificada'
}

const ALUNOS_INICIAIS: AlunoFrequencia[] = [
  { id: 1, nome: 'Ana Beatriz Souza', matricula: '20260101', turma: '5º Ano A', escolaId: 1, oficinaId: 1, historicoPresenca: 95, statusHoje: 'presente' },
  { id: 2, nome: 'Bruno Henrique Santos', matricula: '20260102', turma: '5º Ano A', escolaId: 1, oficinaId: 1, historicoPresenca: 70, statusHoje: 'falta' },
  { id: 3, nome: 'Camila Oliveira Lima', matricula: '20260103', turma: '5º Ano A', escolaId: 1, oficinaId: 1, historicoPresenca: 90, statusHoje: 'presente' },
  { id: 4, nome: 'Daniel Ferreira Costa', matricula: '20260104', turma: '5º Ano A', escolaId: 1, oficinaId: 1, historicoPresenca: 62, statusHoje: 'falta' },
  { id: 5, nome: 'Eduardo Martins Silva', matricula: '20260105', turma: '5º Ano A', escolaId: 1, oficinaId: 1, historicoPresenca: 100, statusHoje: 'presente' },
  { id: 6, nome: 'Fernanda Rocha Ribeiro', matricula: '20260106', turma: '6º Ano B', escolaId: 1, oficinaId: 2, historicoPresenca: 85, statusHoje: 'presente' },
  { id: 7, nome: 'Gabriel Alves Pereira', matricula: '20260107', turma: '6º Ano B', escolaId: 1, oficinaId: 2, historicoPresenca: 72, statusHoje: 'justificada' },
  { id: 8, nome: 'Helena Castro Mendes', matricula: '20260108', turma: '6º Ano B', escolaId: 1, oficinaId: 2, historicoPresenca: 98, statusHoje: 'presente' },
  { id: 9, nome: 'Igor Vinícius Barbosa', matricula: '20260109', turma: '7º Ano C', escolaId: 2, oficinaId: 3, historicoPresenca: 92, statusHoje: 'presente' },
  { id: 10, nome: 'Julia Maria Ramos', matricula: '20260110', turma: '7º Ano C', escolaId: 2, oficinaId: 3, historicoPresenca: 68, statusHoje: 'falta' },
  { id: 11, nome: 'Lucas Gabriel Carvalho', matricula: '20260111', turma: '7º Ano C', escolaId: 2, oficinaId: 3, historicoPresenca: 88, statusHoje: 'presente' },
  { id: 12, nome: 'Mariana Duarte Prado', matricula: '20260112', turma: '8º Ano A', escolaId: 2, oficinaId: 4, historicoPresenca: 96, statusHoje: 'presente' }
]

const HISTORICO_SEMANAL = [
  { dia: 'Segunda', presencas: 88, faltas: 12 },
  { dia: 'Terça', presencas: 92, faltas: 8 },
  { dia: 'Quarta', presencas: 85, faltas: 15 },
  { dia: 'Quinta', presencas: 90, faltas: 10 },
  { dia: 'Sexta', presencas: 79, faltas: 21 },
]

export default function FrequenciaClient({
  escolas,
  oficinas,
}: {
  escolas: EscolaOption[]
  oficinas: OficinaOption[]
}) {
  const [escolaId, setEscolaId] = useState<number | 'todas'>('todas')
  const [oficinaId, setOficinaId] = useState<number | 'todas'>('todas')
  const [busca, setBusca] = useState('')
  const [dataChamada, setDataChamada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [alunos, setAlunos] = useState<AlunoFrequencia[]>(ALUNOS_INICIAIS)
  const [salvoFeedback, setSalvoFeedback] = useState(false)

  // Filtragem dos alunos
  const alunosFiltrados = useMemo(() => {
    return alunos.filter((aluno) => {
      if (escolaId !== 'todas' && aluno.escolaId !== Number(escolaId)) return false
      if (oficinaId !== 'todas' && aluno.oficinaId !== Number(oficinaId)) return false
      if (busca.trim() !== '') {
        const termo = busca.toLowerCase()
        return (
          aluno.nome.toLowerCase().includes(termo) ||
          aluno.matricula.includes(termo) ||
          aluno.turma.toLowerCase().includes(termo)
        )
      }
      return true
    })
  }, [alunos, escolaId, oficinaId, busca])

  // KPIs
  const totalAlunos = alunosFiltrados.length
  const presentesHoje = alunosFiltrados.filter((a) => a.statusHoje === 'presente').length
  const faltasHoje = alunosFiltrados.filter((a) => a.statusHoje === 'falta').length
  const justificadasHoje = alunosFiltrados.filter((a) => a.statusHoje === 'justificada').length
  const percentualPresencaHoje = totalAlunos > 0 ? Math.round((presentesHoje / totalAlunos) * 100) : 0
  const alunosRiscoEvasao = alunosFiltrados.filter((a) => a.historicoPresenca < 75).length

  // Atualiza status do aluno
  const alterarStatusAluno = (id: number, novoStatus: 'presente' | 'falta' | 'justificada') => {
    setAlunos((prev) =>
      prev.map((aluno) =>
        aluno.id === id ? { ...aluno, statusHoje: novoStatus } : aluno
      )
    )
  }

  // Marcar todos como presente
  const marcarTodosPresentes = () => {
    setAlunos((prev) =>
      prev.map((aluno) => {
        if (
          (escolaId === 'todas' || aluno.escolaId === Number(escolaId)) &&
          (oficinaId === 'todas' || aluno.oficinaId === Number(oficinaId))
        ) {
          return { ...aluno, statusHoje: 'presente' }
        }
        return aluno
      })
    )
  }

  // Simular salvamento
  const salvarChamada = () => {
    setSalvoFeedback(true)
    setTimeout(() => setSalvoFeedback(false), 3000)
  }

  // Gerar PDF Diário de Frequência
  const gerarPDFDiario = () => {
    const doc = new jsPDF()

    // Cabeçalho Oficial
    doc.setFillColor(15, 23, 42) // Slate 900
    doc.rect(0, 0, 210, 28, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('SECRETARIA MUNICIPAL DE EDUCAÇÃO — SME', 14, 12)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Diário de Frequência das Oficinas de Tempo Integral — Data: ${dataChamada}`, 14, 20)

    // Filtro info
    const escolaNome = escolaId === 'todas' ? 'Todas as Escolas' : escolas.find(e => e.id === Number(escolaId))?.nome || ''
    const oficinaNome = oficinaId === 'todas' ? 'Todas as Oficinas' : oficinas.find(o => o.id === Number(oficinaId))?.nome || ''

    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)
    doc.text(`Unidade Escolar: ${escolaNome} | Oficina: ${oficinaNome}`, 14, 35)

    // Tabela
    const tableData = alunosFiltrados.map((a, idx) => [
      idx + 1,
      a.nome,
      a.matricula,
      a.turma,
      `${a.historicoPresenca}%`,
      a.statusHoje === 'presente' ? 'PRESENTE' : a.statusHoje === 'falta' ? 'FALTA' : 'JUSTIFICADA'
    ])

    autoTable(doc, {
      startY: 40,
      head: [['#', 'Nome do Aluno', 'Matrícula', 'Turma', 'Assiduidade', 'Status Hoje']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })

    // Campo de Assinatura
    const finalY = (doc as any).lastAutoTable.finalY || 180
    if (finalY < 240) {
      doc.setFontSize(9)
      doc.text('___________________________________________', 14, finalY + 30)
      doc.text('Assinatura do Oficineiro / Instrutor', 14, finalY + 35)

      doc.text('___________________________________________', 120, finalY + 30)
      doc.text('Assinatura do Gestor Escolar', 120, finalY + 35)
    }

    doc.save(`Diario_Frequencia_GTI_${dataChamada}.pdf`)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-950 min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UserCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Frequência & Controle de Evasão
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Novo Módulo
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Chamada diária das oficinas de tempo integral, monitoramento de assiduidade e prevenção da evasão escolar.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={marcarTodosPresentes}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            Marcar Todos Presentes
          </button>
          <button
            onClick={gerarPDFDiario}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center gap-2"
          >
            <Download size={16} className="text-indigo-400" />
            Gerar Diário (PDF)
          </button>
          <button
            onClick={salvarChamada}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            {salvoFeedback ? <Check size={16} /> : <Save size={16} />}
            {salvoFeedback ? 'Chamada Salva!' : 'Salvar Chamada'}
          </button>
        </div>
      </div>

      {/* Bar de Filtros & Data */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <School size={14} className="text-indigo-400" /> Escola
          </label>
          <select
            value={escolaId}
            onChange={(e) => setEscolaId(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="todas">Todas as Escolas</option>
            {escolas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <BookOpen size={14} className="text-emerald-400" /> Oficina
          </label>
          <select
            value={oficinaId}
            onChange={(e) => setOficinaId(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="todas">Todas as Oficinas</option>
            {oficinas.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Calendar size={14} className="text-purple-400" /> Data da Aula
          </label>
          <input
            type="date"
            value={dataChamada}
            onChange={(e) => setDataChamada(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Search size={14} className="text-amber-400" /> Buscar Aluno / Turma
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Digite nome ou turma..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Cards de Métricas / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Alunos</span>
            <Users size={18} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalAlunos}</div>
          <p className="text-[10px] text-slate-400 mt-1">Filtrados na chamada</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-900 border border-emerald-900/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">Presentes Hoje</span>
            <UserCheck size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-2">{presentesHoje}</div>
          <p className="text-[10px] text-emerald-400/80 mt-1">{percentualPresencaHoje}% de assiduidade</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/30 to-slate-900 border border-rose-900/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider">Faltas Hoje</span>
            <UserX size={18} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-2">{faltasHoje}</div>
          <p className="text-[10px] text-rose-400/80 mt-1">Sem justificativa</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-900/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">Justificadas</span>
            <CheckCircle2 size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{justificadasHoje}</div>
          <p className="text-[10px] text-amber-400/80 mt-1">Atestado / Licença</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950/50 to-slate-900 border border-red-800/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-red-400 uppercase tracking-wider">Risco de Evasão</span>
            <AlertTriangle size={18} className="text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-300 mt-2">{alunosRiscoEvasao}</div>
          <p className="text-[10px] text-red-400/80 mt-1">Assiduidade &lt; 75%</p>
        </div>
      </div>

      {/* Conteúdo Principal: Tabela de Chamada + Gráfico Semanal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabela de Chamada */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              Lista de Alunos da Oficina ({alunosFiltrados.length})
            </h2>
            <span className="text-xs text-slate-400">
              Clique nos botões para alterar o status individual
            </span>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Aluno / Matrícula</th>
                    <th className="py-3 px-4">Turma</th>
                    <th className="py-3 px-4">Assiduidade Acumulada</th>
                    <th className="py-3 px-4 text-center">Status em {dataChamada}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-semibold">
                  {alunosFiltrados.map((aluno) => {
                    const emRisco = aluno.historicoPresenca < 75
                    return (
                      <tr key={aluno.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            {aluno.nome}
                            {emRisco && (
                              <span
                                title="Alerta: Aluno em Risco de Evasão Escolar (Frequência inferior a 75%)"
                                className="p-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30"
                              >
                                <AlertTriangle size={13} />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">MAT: {aluno.matricula}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{aluno.turma}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  emRisco ? 'bg-rose-500' : aluno.historicoPresenca >= 90 ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                                style={{ width: `${aluno.historicoPresenca}%` }}
                              />
                            </div>
                            <span
                              className={`text-[11px] font-bold ${
                                emRisco ? 'text-rose-400' : 'text-slate-300'
                              }`}
                            >
                              {aluno.historicoPresenca}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => alterarStatusAluno(aluno.id, 'presente')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                aluno.statusHoje === 'presente'
                                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                                  : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
                              }`}
                            >
                              <CheckCircle2 size={13} /> P
                            </button>
                            <button
                              onClick={() => alterarStatusAluno(aluno.id, 'falta')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                aluno.statusHoje === 'falta'
                                  ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20'
                                  : 'bg-slate-800 text-slate-400 hover:text-rose-400'
                              }`}
                            >
                              <XCircle size={13} /> F
                            </button>
                            <button
                              onClick={() => alterarStatusAluno(aluno.id, 'justificada')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                aluno.statusHoje === 'justificada'
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                                  : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                              }`}
                            >
                              FJ
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {alunosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Nenhum aluno encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Lateral: Gráfico Semanal + Alertas */}
        <div className="space-y-6">
          {/* Gráfico Semanal */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              Frequência Média Semanal (%)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HISTORICO_SEMANAL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="dia" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Bar dataKey="presencas" fill="#6366f1" radius={[6, 6, 0, 0]} name="Presença %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card de Prevenção de Evasão */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-900/40 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <h3 className="text-sm font-extrabold text-white">Diretrizes de Evasão Escolar (FNDE)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Alunos com taxa de frequência abaixo de **75%** são sinalizados automaticamente com alerta vermelho. A coordenação da SME pode exportar relatórios de busca ativa.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Alunos em Risco Crítico:</span>
                <span className="font-bold text-rose-400">{alunosRiscoEvasao} alunos</span>
              </div>
              <div className="flex justify-between">
                <span>Meta de Assiduidade SME:</span>
                <span className="font-bold text-emerald-400">&ge; 85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
