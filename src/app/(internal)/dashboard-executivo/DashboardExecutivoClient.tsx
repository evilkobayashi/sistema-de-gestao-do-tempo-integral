'use client'

import { useState } from 'react'
import {
  School,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FilterX,
  Building2,
  Layers,
  Award,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts'

type Lookup = { id: number; nome: string }
type Lotacao = {
  id: number
  escola: string
  escolaId: number
  turno: string
  turnoId: number
  turma: string
  oficina: string
  oficinaId: number
  oficineiro: string
  oficineiroId: number
  horasAula: number
  horasPlanejamento: number
  dias: string
}

type OficineiroResumo = {
  id: number
  oficineiro: string
  oficina: string
  cargaTotal: number
  horasAula: number
  horasPlanejamento: number
}

interface Props {
  lotacoes: Lotacao[]
  escolas: Lookup[]
  turnos: Lookup[]
  kpis: {
    escolasCount: number
    oficineirosCount: number
    oficinasCount: number
    turmasCount: number
    horasAula: number
    horasPlanejamento: number
    cargaTotal: number
  }
  resumoOficineiros: OficineiroResumo[]
  resumoEscolas: any[]
  sessionUser: { id: number; nome: string; email: string; cargo: string } | null
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6']

export default function DashboardExecutivoClient({
  lotacoes,
  escolas,
  turnos,
  resumoOficineiros,
  sessionUser,
}: Props) {
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>('')
  const [selectedTurnoId, setSelectedTurnoId] = useState<string>('')
  const [selectedStatusAlert, setSelectedStatusAlert] = useState<string>('todos')

  // 1. Filtrar Lotações
  const filtered = lotacoes.filter((row) => {
    const matchEscola = selectedEscolaId === '' || row.escolaId === Number(selectedEscolaId)
    const matchTurno = selectedTurnoId === '' || row.turnoId === Number(selectedTurnoId)
    return matchEscola && matchTurno
  })

  // 2. Cálculo dos Oficineiros e Carga Horária Total (Trava 40h)
  const oficineiroMap = filtered.reduce((acc, r) => {
    if (!acc[r.oficineiroId]) {
      acc[r.oficineiroId] = {
        id: r.oficineiroId,
        nome: r.oficineiro,
        escolas: new Set<string>(),
        oficinas: new Set<string>(),
        horasAula: 0,
        horasPlanejamento: 0,
      }
    }
    acc[r.oficineiroId].escolas.add(r.escola)
    acc[r.oficineiroId].oficinas.add(r.oficina)
    acc[r.oficineiroId].horasAula += r.horasAula
    acc[r.oficineiroId].horasPlanejamento += r.horasPlanejamento
    return acc
  }, {} as Record<number, { id: number; nome: string; escolas: Set<string>; oficinas: Set<string>; horasAula: number; horasPlanejamento: number }>)

  const oficineiroList = Object.values(oficineiroMap).map((o) => {
    const total = o.horasAula + o.horasPlanejamento
    let status: 'disponivel' | 'limite' | 'sobrecarga' = 'disponivel'
    if (total > 40) status = 'sobrecarga'
    else if (total >= 32) status = 'limite'
    return { ...o, total, status }
  })

  const filteredOficineiros = oficineiroList.filter((o) => {
    if (selectedStatusAlert === 'todos') return true
    return o.status === selectedStatusAlert
  })

  // KPIs
  const totalEscolas = new Set(filtered.map((r) => r.escolaId)).size
  const totalOficineiros = oficineiroList.length
  const totalTurmas = new Set(filtered.map((r) => `${r.escolaId}-${r.turnoId}-${r.turma}`)).size
  const totalHorasAula = filtered.reduce((s, r) => s + r.horasAula, 0)
  const totalHorasPlanejamento = filtered.reduce((s, r) => s + r.horasPlanejamento, 0)
  const cargaHorariaGlobal = totalHorasAula + totalHorasPlanejamento
  const sobrecargaCount = oficineiroList.filter((o) => o.status === 'sobrecarga').length
  const limiteCount = oficineiroList.filter((o) => o.status === 'limite').length

  // Dados para Gráfico: Carga por Escola
  const cargaEscolaMap = filtered.reduce((acc, r) => {
    acc[r.escola] = (acc[r.escola] || 0) + r.horasAula + r.horasPlanejamento
    return acc
  }, {} as Record<string, number>)

  const dataCargaEscola = Object.entries(cargaEscolaMap)
    .map(([escola, total]) => ({ escola: escola.length > 18 ? escola.slice(0, 18) + '...' : escola, total }))
    .sort((a, b) => b.total - a.total)

  // Dados para Gráfico: Distribuição por Oficina
  const oficinasDistributionMap = filtered.reduce((acc, r) => {
    acc[r.oficina] = (acc[r.oficina] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dataOficinasPie = Object.entries(oficinasDistributionMap).map(([name, value]) => ({ name, value }))

  // Dados para Gráfico: Proporção Aula vs Planejamento
  const dataHorasPie = [
    { name: 'Horas Aula', value: totalHorasAula, color: '#6366f1' },
    { name: 'Horas Planejamento', value: totalHorasPlanejamento, color: '#10b981' },
  ]

  function resetFilters() {
    setSelectedEscolaId('')
    setSelectedTurnoId('')
    setSelectedStatusAlert('todos')
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Executivo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              PAINEL EXECUTIVO BI • SECRETARIA MUNICIPAL DE EDUCAÇÃO
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Gestão de Tempo Integral <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">(1º ao 9º Ano)</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl font-medium">
              Monitoramento estratégico da distribuição de oficinas, alocação da carga horária de oficineiros e controle rigoroso da Trava 40h.
            </p>
          </div>

          {sessionUser && (
            <div className="bg-slate-950/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white text-sm shadow-md">
                {sessionUser.cargo === 'admin' ? 'SME' : 'GES'}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  {sessionUser.nome}
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{sessionUser.cargo} • {sessionUser.email}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros Executivos */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-3xl">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Escola
            </label>
            <select
              value={selectedEscolaId}
              onChange={(e) => setSelectedEscolaId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todas as Escolas ({escolas.length})</option>
              {escolas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Turno
            </label>
            <select
              value={selectedTurnoId}
              onChange={(e) => setSelectedTurnoId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todos os Turnos ({turnos.length})</option>
              {turnos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status Trava 40h
            </label>
            <select
              value={selectedStatusAlert}
              onChange={(e) => setSelectedStatusAlert(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="disponivel">🟢 Disponível (&lt; 32h)</option>
              <option value="limite">🟡 No Limite (32h - 40h)</option>
              <option value="sobrecarga">🔴 Sobrecarga (&gt; 40h)</option>
            </select>
          </div>
        </div>

        {(selectedEscolaId || selectedTurnoId || selectedStatusAlert !== 'todos') && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 self-end md:self-center"
          >
            <FilterX size={15} />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Escolas Atendidas</span>
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalEscolas}</div>
          <p className="text-[10px] text-slate-400 font-medium">Unidades no programa</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Oficineiros Loteados</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalOficineiros}</div>
          <p className="text-[10px] text-emerald-400 font-medium">Corpo docente ativo</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Turmas Tempo Integral</span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalTurmas}</div>
          <p className="text-[10px] text-slate-400 font-medium">1º ao 9º Ano Atendidos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Carga Horária Total</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{cargaHorariaGlobal}h</div>
          <p className="text-[10px] text-slate-400 font-medium">{totalHorasAula}h aula + {totalHorasPlanejamento}h plan.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Alertas Trava 40h</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{sobrecargaCount}</div>
          <p className="text-[10px] text-amber-400 font-medium">{limiteCount} em limite de 40h</p>
        </div>
      </div>

      {/* Seção de Gráficos BI Executivos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Carga Horária por Escola (Bar Chart Vertical) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Carga Horária Total por Unidade Escolar
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
              Horas Aula + Planejamento
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCargaEscola} margin={{ top: 10, right: 20, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="escola" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(v: any) => [`${v} horas`, 'Carga Horária']}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribuição por Oficina (Pie Chart) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Distribuição de Oficinas
              </h3>
            </div>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataOficinasPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dataOficinasPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela Executiva: Gestão da Trava 40h de Oficineiros */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Monitoramento Trava 40h por Oficineiro
            </h3>
            <p className="text-xs text-slate-400">Relação consolidada de profissionais e alerta automático de limite de carga horária semanal.</p>
          </div>
          <div className="text-xs font-bold text-slate-400">
            Exibindo <span className="text-white">{filteredOficineiros.length}</span> profissionais
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Profissional / Oficineiro</th>
                <th className="py-3 px-4">Escolas Alocadas</th>
                <th className="py-3 px-4">Oficinas Ministradas</th>
                <th className="py-3 px-4 text-center">Horas Aula</th>
                <th className="py-3 px-4 text-center">Horas Planej.</th>
                <th className="py-3 px-4 text-center">Total Semanal</th>
                <th className="py-3 px-4 text-center">Status Trava 40h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredOficineiros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    Nenhum oficineiro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOficineiros.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {o.nome.charAt(0)}
                      </div>
                      {o.nome}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {Array.from(o.escolas).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {Array.from(o.oficinas).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-300">{o.horasAula}h</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-300">{o.horasPlanejamento}h</td>
                    <td className="py-3 px-4 text-center font-black text-white text-sm">{o.total}h</td>
                    <td className="py-3 px-4 text-center">
                      {o.status === 'disponivel' && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Disponível (&lt;32h)
                        </span>
                      )}
                      {o.status === 'limite' && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 inline-flex items-center gap-1">
                          <AlertTriangle size={12} />
                          No Limite (32h-40h)
                        </span>
                      )}
                      {o.status === 'sobrecarga' && (
                        <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30 inline-flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={12} />
                          Sobrecarga (&gt;40h)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
