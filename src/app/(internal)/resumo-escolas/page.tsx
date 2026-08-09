import DataTable from '@/components/ui/DataTable'
import { getResumoEscolas } from '@/lib/queries'

export default async function ResumoEscolasPage() {
  const data = await getResumoEscolas()
  const columns = [
    { key: 'escola' as const, header: 'Escola' },
    { key: 'nOficinas' as const, header: 'Nº Oficinas' },
    { key: 'nOficineiros' as const, header: 'Nº Oficineiros' },
    { key: 'horasAula' as const, header: 'Horas Aula' },
    { key: 'turmas' as const, header: 'Turmas' },
  ]
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Resumo das Escolas</h2>
      <DataTable columns={columns} data={data.map((r, i) => ({ ...r, id: i + 1 }))} />
    </div>
  )
}
