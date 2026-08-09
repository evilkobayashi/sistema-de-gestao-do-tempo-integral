'use client'

import { useState } from 'react'
import {
  createEscola, deleteEscola,
  createOficina, deleteOficina,
  createOfineiro, deleteOfineiro,
} from '@/app/actions/configuracoes'

type Item = { id: number; nome: string }

function LookupSection({
  title,
  items,
  onCreate,
  onDelete,
}: {
  title: string
  items: Item[]
  onCreate: (fd: FormData) => Promise<any>
  onDelete: (id: number) => Promise<any>
}) {
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: number) {
    if (!confirm(`Excluir esta ${title.slice(0, -1).toLowerCase()}?`)) return
    setError(null)
    const result = await onDelete(id)
    if (result && result.error) {
      setError(result.error)
    }
  }

  async function handleCreate(fd: FormData) {
    setError(null)
    const result = await onCreate(fd)
    if (result && result.error) {
      setError(result.error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {error && (
        <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      <form action={handleCreate} className="flex gap-2">
        <input name="nome" placeholder={`Novo ${title.toLowerCase().slice(0, -1)}...`} required className="flex-1 border rounded px-3 py-1 text-sm" />
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Adicionar</button>
      </form>
      <ul className="divide-y text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between items-center py-1">
            <span>{item.nome}</span>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 text-xs hover:underline">Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface Props {
  escolas: Item[]
  oficinas: Item[]
  oficineiros: Item[]
}

export default function ConfiguracoesClient({ escolas, oficinas, oficineiros }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Configurações do Sistema</h2>
      </div>

      {/* Painel de Infraestrutura Supabase Cloud */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-2">
                Supabase Cloud Database (PostgreSQL)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ACTIVE_HEALTHY
                </span>
              </h3>
              <p className="text-xs text-slate-400">Banco de dados em nuvem corporativo para a rede de ensino de tempo integral</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Ref ID</span>
            <span className="font-mono font-bold text-indigo-300">ovehjqfxamdvixckpwjm</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Região</span>
            <span className="font-bold text-slate-200">sa-east-1 (São Paulo)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Host DB</span>
            <span className="font-mono text-[11px] text-slate-300 truncate block">db.ovehjqfxamdvixckpwjm...</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schema RLS</span>
            <span className="font-bold text-emerald-400">001_initial_schema.sql</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LookupSection title="Escolas" items={escolas} onCreate={createEscola} onDelete={deleteEscola} />
        <LookupSection title="Oficinas" items={oficinas} onCreate={createOficina} onDelete={deleteOficina} />
        <LookupSection title="Oficineiros" items={oficineiros} onCreate={createOfineiro} onDelete={deleteOfineiro} />
      </div>
    </div>
  )
}
