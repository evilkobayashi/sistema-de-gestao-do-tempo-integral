'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface Column<T> {
  key: keyof T
  header: string
  render?: (val: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
}

type SortDirection = 'asc' | 'desc'

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = filter
    ? data.filter((row) =>
        Object.values(row as object).some((v) =>
          String(v).toLowerCase().includes(filter.toLowerCase())
        )
      )
    : data

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        const aStr = String(aVal ?? '')
        const bStr = String(bVal ?? '')
        const cmp = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : filtered

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center relative">
        <Search className="absolute left-7 text-slate-400 pointer-events-none" size={16} />
        <input
          className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 transition-all bg-slate-50/50"
          placeholder="Pesquisar registros..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/75 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-5 py-3 font-semibold cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key ? (
                      <span className="text-indigo-600">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>
                    ) : (
                      <span className="text-slate-300"> ▲</span>
                    )}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sorted.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-5 py-3.5 text-sm">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-5 py-3.5 flex gap-2 justify-end items-center">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-all"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-all"
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-8 text-center text-slate-400 text-sm">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
