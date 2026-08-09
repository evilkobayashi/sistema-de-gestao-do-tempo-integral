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
  onCreate: (fd: FormData) => Promise<void>
  onDelete: (id: number) => Promise<{ error?: string } | undefined | void>
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
    await onCreate(fd)
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Configurações</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LookupSection title="Escolas" items={escolas} onCreate={createEscola} onDelete={deleteEscola} />
        <LookupSection title="Oficinas" items={oficinas} onCreate={createOficina} onDelete={deleteOficina} />
        <LookupSection title="Oficineiros" items={oficineiros} onCreate={createOfineiro} onDelete={deleteOfineiro} />
      </div>
    </div>
  )
}
