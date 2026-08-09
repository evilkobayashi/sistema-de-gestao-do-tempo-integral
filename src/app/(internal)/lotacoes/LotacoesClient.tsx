'use client'

import { useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { createLotacao, deleteLotacao, updateLotacao } from '@/app/actions/lotacoes'

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
  oficinas: Lookup[]
  oficineiros: Lookup[]
  turnos: Lookup[]
}

const columns = [
  { key: 'escola' as const, header: 'Escola' },
  { key: 'turno' as const, header: 'Turno' },
  { key: 'turma' as const, header: 'Turma' },
  { key: 'oficina' as const, header: 'Oficina' },
  { key: 'oficineiro' as const, header: 'Oficineiro' },
  { key: 'horasAula' as const, header: 'H. Aula', render: (v: string | number) => `${v}h` },
  { key: 'horasPlanejamento' as const, header: 'H. Plan.', render: (v: string | number) => `${v}h` },
  { key: 'dias' as const, header: 'Dias' },
]

export default function LotacoesClient({ lotacoes, escolas, oficinas, oficineiros, turnos }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingLotacao, setEditingLotacao] = useState<Lotacao | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = editingLotacao
      ? await updateLotacao(editingLotacao.id, formData)
      : await createLotacao(formData)

    if (result?.error) {
      setError(result.error)
      return
    }
    setOpen(false)
    setEditingLotacao(null)
    setError(null)
  }

  async function handleDelete(row: Lotacao) {
    if (!confirm('Excluir esta lotação?')) return
    await deleteLotacao(row.id)
  }

  function handleEdit(row: Lotacao) {
    setEditingLotacao(row)
    setOpen(true)
  }

  function handleOpenNew() {
    setEditingLotacao(null)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setError(null)
    setEditingLotacao(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Cadastro de Lotações</h2>
          <p className="text-xs text-slate-400">Gerencie a alocação de oficineiros e turmas na rede de tempo integral.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all"
        >
          + Nova Lotação
        </button>
      </div>

      <DataTable columns={columns} data={lotacoes} onEdit={handleEdit} onDelete={handleDelete} />

      <Modal isOpen={open} title={editingLotacao ? 'Editar Lotação' : 'Nova Lotação'} onClose={handleClose}>
        <form key={editingLotacao ? editingLotacao.id : 'new'} action={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-100 p-2 rounded-lg">{error}</p>}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Escola</label>
            <select
              name="escolaId"
              required
              defaultValue={editingLotacao?.escolaId ?? ''}
              className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-all bg-slate-50/50"
            >
              <option value="">Selecione a Escola...</option>
              {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Turno</label>
              <select
                name="turnoId"
                required
                defaultValue={editingLotacao?.turnoId ?? ''}
                className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-all bg-slate-50/50"
              >
                <option value="">Turno...</option>
                {turnos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Turma</label>
              <input
                name="turma"
                placeholder="Ex: 101-A"
                required
                defaultValue={editingLotacao?.turma ?? ''}
                className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Oficina</label>
            <select
              name="oficinaId"
              required
              defaultValue={editingLotacao?.oficinaId ?? ''}
              className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-all bg-slate-50/50"
            >
              <option value="">Selecione a Oficina...</option>
              {oficinas.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Oficineiro</label>
            <select
              name="oficineiroId"
              required
              defaultValue={editingLotacao?.oficineiroId ?? ''}
              className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 transition-all bg-slate-50/50"
            >
              <option value="">Selecione o Oficineiro...</option>
              {oficineiros.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Horas Aula</label>
              <input
                name="horasAula"
                type="number"
                step="0.5"
                placeholder="Ex: 8"
                required
                defaultValue={editingLotacao?.horasAula ?? ''}
                className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 transition-all bg-slate-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Horas Planejamento</label>
              <input
                name="horasPlanejamento"
                type="number"
                step="0.5"
                placeholder="Ex: 2"
                required
                defaultValue={editingLotacao?.horasPlanejamento ?? ''}
                className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dias</label>
            <input
              name="dias"
              placeholder="Ex: Seg/Qua"
              required
              defaultValue={editingLotacao?.dias ?? ''}
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
              onClick={handleClose}
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
