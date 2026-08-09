'use client'

import { useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { createOfineiro, deleteOfineiro } from '@/app/actions/configuracoes'

type OficineiroRow = {
  id: number // unique row index for DataTable
  oficineiroId: number // database ID of oficineiro
  oficineiro: string
  oficina: string
  horasAula: number
  horasPlanejamento: number
  cargaTotal: number
}

interface Props {
  oficineirosData: OficineiroRow[]
}

export default function OficineirosClient({ oficineirosData }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate cumulative workload per oficineiro name (since a teacher can have multiple rows for different workshops)
  const totalCargas = oficineirosData.reduce((acc, curr) => {
    const name = curr.oficineiro
    acc[name] = (acc[name] || 0) + curr.cargaTotal
    return acc
  }, {} as Record<string, number>)

  async function handleCreate(formData: FormData) {
    setError(null)
    const nome = String(formData.get('nome')).trim()
    if (!nome) return

    try {
      await createOfineiro(formData)
      setOpen(false)
    } catch (err: any) {
      setError('Erro ao cadastrar oficineiro.')
    }
  }

  async function handleDelete(row: OficineiroRow) {
    if (!confirm(`Deseja realmente excluir o oficineiro "${row.oficineiro}"?`)) return
    const result = await deleteOfineiro(row.oficineiroId)
    if (result && result.error) {
      alert(result.error)
    }
  }

  const columns = [
    { key: 'oficineiro' as const, header: 'Oficineiro' },
    { key: 'oficina' as const, header: 'Oficina' },
    { key: 'horasAula' as const, header: 'H. Aula', render: (v: any) => `${v}h` },
    { key: 'horasPlanejamento' as const, header: 'H. Plan.', render: (v: any) => `${v}h` },
    {
      key: 'cargaTotal' as const,
      header: 'Carga Acumulada',
      render: (v: any, row: OficineiroRow) => {
        const total = totalCargas[row.oficineiro] || 0
        const pct = Math.min((total / 40) * 100, 100)

        let barColor = 'bg-emerald-500'
        let textColor = 'text-emerald-700'
        let badgeBg = 'bg-emerald-50 border-emerald-100'
        let label = 'Disponível'

        if (total === 40) {
          barColor = 'bg-amber-500'
          textColor = 'text-amber-700'
          badgeBg = 'bg-amber-50 border-amber-100'
          label = 'No Limite'
        } else if (total > 40) {
          barColor = 'bg-rose-500'
          textColor = 'text-rose-700'
          badgeBg = 'bg-rose-50 border-rose-100'
          label = 'Sobrecarga'
        }

        return (
          <div className="flex flex-col gap-1.5 min-w-[180px] py-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">{total}h / 40h</span>
              <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${badgeBg} ${textColor}`}>
                {label}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className={`${barColor} h-full transition-all duration-300`} style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Gestão de Oficineiros</h2>
          <p className="text-xs text-slate-400">Gerencie a carga horária de trabalho e cadastre novos profissionais.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all"
        >
          + Novo Oficineiro
        </button>
      </div>

      <DataTable columns={columns} data={oficineirosData} onDelete={handleDelete} />

      <Modal isOpen={open} title="Novo Oficineiro" onClose={() => { setOpen(false); setError(null) }}>
        <form action={handleCreate} className="space-y-4">
          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-100 p-2 rounded-lg">{error}</p>}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome Completo</label>
            <input
              name="nome"
              placeholder="Digite o nome do oficineiro..."
              required
              className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 transition-all bg-slate-50/50"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-all"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null) }}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
