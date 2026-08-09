'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { oficineiro: string; total: number }[]
}

export default function BarChartOficineiros({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Carga Horária por Oficineiro</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ bottom: 40 }}>
          <XAxis dataKey="oficineiro" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
          <Tooltip formatter={(v) => [`${v}h`, 'Carga Horária']} />
          <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
