'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { escola: string; total: number }[]
}

export default function BarChartCargaHoraria({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Carga Horária por Escola</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
          <YAxis type="category" dataKey="escola" tick={{ fontSize: 11 }} width={80} />
          <Tooltip formatter={(v) => [`${v}h`, 'Carga Horária']} />
          <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
