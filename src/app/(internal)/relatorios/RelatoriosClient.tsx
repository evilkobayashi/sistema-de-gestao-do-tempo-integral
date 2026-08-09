'use client'

import ReportGenerator from '@/components/pdf/ReportGenerator'

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
}

export default function RelatoriosClient({ lotacoes }: Props) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Bloco de Botões de Ações */}
      <div className="flex gap-3 flex-wrap bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <ReportGenerator type="geral" data={lotacoes} filename="relatorio-geral.pdf" label="PDF Relatório Geral" />
        <ReportGenerator type="escola" data={lotacoes} filename="relatorio-escolas.pdf" label="PDF por Escola" />
        <ReportGenerator type="oficineiro" data={lotacoes} filename="relatorio-oficineiros.pdf" label="PDF por Oficineiro" />
      </div>

      {/* Bloco de Visualização - Relatório Geral */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Prévia: Relatório Geral</h2>
          <p className="text-[10px] text-slate-400">Exibição de todas as lotações cadastradas na rede municipal.</p>
        </div>
        <div className="overflow-x-auto border rounded-lg max-h-[350px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-bold tracking-wider border-b sticky top-0">
              <tr>
                {['Escola', 'Turno', 'Turma', 'Oficina', 'Oficineiro', 'H. Aula', 'H. Plan.', 'Dias'].map((h) => (
                  <th key={h} className="px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lotacoes.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-medium">{row.escola}</td>
                  <td className="px-3 py-2.5">{row.turno}</td>
                  <td className="px-3 py-2.5">{row.turma}</td>
                  <td className="px-3 py-2.5">{row.oficina}</td>
                  <td className="px-3 py-2.5 font-medium">{row.oficineiro}</td>
                  <td className="px-3 py-2.5 font-mono">{row.horasAula}h</td>
                  <td className="px-3 py-2.5 font-mono">{row.horasPlanejamento}h</td>
                  <td className="px-3 py-2.5">{row.dias}</td>
                </tr>
              ))}
              {lotacoes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-400">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloco de Visualização - Por Escola */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Prévia: Equipes por Escola</h2>
          <p className="text-[10px] text-slate-400">Agrupamento contínuo das lotações de acordo com a unidade de ensino.</p>
        </div>
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1">
          {Array.from(new Set(lotacoes.map((l) => l.escola))).sort().map((escola) => (
            <div key={escola} className="space-y-2">
              <h3 className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg max-w-fit">{escola}</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-bold tracking-wider border-b">
                    <tr>
                      {['Turno', 'Turma', 'Oficina', 'Oficineiro', 'H. Aula', 'H. Plan.', 'Dias'].map((h) => (
                        <th key={h} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {lotacoes.filter((l) => l.escola === escola).map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5">{row.turno}</td>
                        <td className="px-3 py-2.5">{row.turma}</td>
                        <td className="px-3 py-2.5">{row.oficina}</td>
                        <td className="px-3 py-2.5 font-medium">{row.oficineiro}</td>
                        <td className="px-3 py-2.5 font-mono">{row.horasAula}h</td>
                        <td className="px-3 py-2.5 font-mono">{row.horasPlanejamento}h</td>
                        <td className="px-3 py-2.5">{row.dias}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {lotacoes.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">Nenhum registro encontrado.</p>
          )}
        </div>
      </div>

      {/* Bloco de Visualização - Por Oficineiro */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Prévia: Carga por Oficineiro</h2>
          <p className="text-[10px] text-slate-400">Agrupamento contínuo das lotações de acordo com o profissional.</p>
        </div>
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1">
          {Array.from(new Set(lotacoes.map((l) => l.oficineiro))).sort().map((ofic) => (
            <div key={ofic} className="space-y-2">
              <h3 className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg max-w-fit">{ofic}</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-bold tracking-wider border-b">
                    <tr>
                      {['Escola', 'Turno', 'Turma', 'Oficina', 'H. Aula', 'H. Plan.', 'Dias'].map((h) => (
                        <th key={h} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {lotacoes.filter((l) => l.oficineiro === ofic).map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-medium">{row.escola}</td>
                        <td className="px-3 py-2.5">{row.turno}</td>
                        <td className="px-3 py-2.5">{row.turma}</td>
                        <td className="px-3 py-2.5">{row.oficina}</td>
                        <td className="px-3 py-2.5 font-mono">{row.horasAula}h</td>
                        <td className="px-3 py-2.5 font-mono">{row.horasPlanejamento}h</td>
                        <td className="px-3 py-2.5">{row.dias}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {lotacoes.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">Nenhum registro encontrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}
