import React from 'react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}

export default function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-4 min-w-0 hover:shadow-md hover:border-slate-300/60 transition-all">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold leading-none">{label}</span>
        <span className="text-lg font-bold text-slate-800 tracking-tight mt-1 leading-none">{value}</span>
        {sub && <span className="text-[10px] text-slate-400 mt-1">{sub}</span>}
      </div>
    </div>
  )
}
