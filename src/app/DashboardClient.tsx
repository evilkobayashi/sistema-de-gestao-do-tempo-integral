'use client'

import { useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import BarChartCargaHoraria from '@/components/charts/BarChartCargaHoraria'
import DonutChartOficinas from '@/components/charts/DonutChartOficinas'
import BarChartOficineiros from '@/components/charts/BarChartOficineiros'
import DonutChartTurnos from '@/components/charts/DonutChartTurnos'
import { School, Users, BookOpen, GraduationCap, Clock, CalendarDays, BarChart2, FilterX } from 'lucide-react'

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

interface Props {
  lotacoes: Lotacao[]
  escolas: Lookup[]
  turnos: Lookup[]
}

export default function DashboardClient({ lotacoes, escolas, turnos }: Props) {
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>('')
  const [selectedTurnoId, setSelectedTurnoId] = useState<string>('')

  // 1. Apply Filters
  const filtered = lotacoes.filter((row) => {
    const matchEscola = selectedEscolaId === '' || row.escolaId === Number(selectedEscolaId)
    const matchTurno = selectedTurnoId === '' || row.turnoId === Number(selectedTurnoId)
    return matchEscola && matchTurno
  })

  // 2. Compute KPIs
  const escolasCount = new Set(filtered.map((r) => r.escolaId)).size
  const oficineirosCount = new Set(filtered.map((r) => r.oficineiroId)).size
  const oficinasCount = new Set(filtered.map((r) => r.oficinaId)).size
  const turmasCount = new Set(filtered.map((r) => `${r.escolaId}-${r.turnoId}-${r.turma}`)).size
  const horasAula = filtered.reduce((s, r) => s + r.horasAula, 0)
  const horasPlanejamento = filtered.reduce((s, r) => s + r.horasPlanejamento, 0)
  const cargaTotal = horasAula + horasPlanejamento

  // 3. Compute Chart: Carga Horária por Escola
  const cargaEscolaMap = filtered.reduce((acc, r) => {
    acc[r.escola] = (acc[r.escola] || 0) + r.horasAula + r.horasPlanejamento
    return acc
  }, {} as Record<string, number>)
  const cargaEscola = Object.entries(cargaEscolaMap)
    .map(([escola, total]) => ({ escola, total }))
    .sort((a, b) => b.total - a.total)

  // 4. Compute Chart: Oficinas por Escola
  const oficinasEscolaMap = filtered.reduce((acc, r) => {
    if (!acc[r.escola]) acc[r.escola] = new Set<number>()
    acc[r.escola].add(r.oficinaId)
    return acc
  }, {} as Record<string, Set<number>>)
  const oficinasEscola = Object.entries(oficinasEscolaMap)
    .map(([escola, set]) => ({ escola, count: set.size }))

  // 5. Compute Chart: Carga Horária por Oficineiro
  const cargaOficineiroMap = filtered.reduce((acc, r) => {
    acc[r.oficineiro] = (acc[r.oficineiro] || 0) + r.horasAula + r.horasPlanejamento
    return acc
  }, {} as Record<string, number>)
  const cargaOficineiro = Object.entries(cargaOficineiroMap)
    .map(([oficineiro, total]) => ({ oficineiro, total }))

  // 6. Compute Chart: Turmas por Turno
  const turmasTurnoMap = filtered.reduce((acc, r) => {
    if (!acc[r.turno]) acc[r.turno] = new Set<string>()
    acc[r.turno].add(`${r.escolaId}-${r.turnoId}-${r.turma}`)
    return acc
  }, {} as Record<string, Set<string>>)
  const turmasTurno = Object.entries(turmasTurnoMap)
    .map(([turno, set]) => ({ turno, count: set.size }))

  function handleResetFilters() {
    setSelectedEscolaId('')
    setSelectedTurnoId('')
  }

  const hasActiveFilters = selectedEscolaId !== '' || selectedTurnoId !== ''

  return (
    <div className="space-y-6">
      {/* Filtros do Dashboard */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1 max-w-2xl">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Escola</span>
            <select
              value={selectedEscolaId}
              onChange={(e) => setSelectedEscolaId(e.target.value)}
              className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-1.5 text-xs text-slate-700 transition-all bg-slate-50/50"
            >
              <option value="">Todas as Escolas...</option>
              {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Turno</span>
            <select
              value={selectedTurnoId}
              onChange={(e) => setSelectedTurnoId(e.target.value)}
              className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-1.5 text-xs text-slate-700 transition-all bg-slate-50/50"
            >
              <option value="">Todos os Turnos...</option>
              {turnos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 self-end md:self-center"
          >
            <FilterX size={14} />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard icon={<School size={20} />} label="Escolas" value={escolasCount} />
        <StatCard icon={<Users size={20} />} label="Oficineiros" value={oficineirosCount} />
        <StatCard icon={<BookOpen size={20} />} label="Oficinas" value={oficinasCount} />
        <StatCard icon={<GraduationCap size={20} />} label="Turmas" value={turmasCount} />
        <StatCard icon={<Clock size={20} />} label="H. Aula" value={`${horasAula}h`} />
        <StatCard icon={<CalendarDays size={20} />} label="H. Plan." value={`${horasPlanejamento}h`} />
        <StatCard icon={<BarChart2 size={20} />} label="Carga Total" value={`${cargaTotal}h`} />
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BarChartCargaHoraria data={cargaEscola} />
        <DonutChartOficinas data={oficinasEscola} />
        <BarChartOficineiros data={cargaOficineiro} />
        <DonutChartTurnos data={turmasTurno} />
      </div>
    </div>
  )
}
