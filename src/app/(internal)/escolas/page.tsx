import DataTable from '@/components/ui/DataTable'
import { getLotacoesCompletas } from '@/lib/queries'

export default async function EscolasPage() {
  const data = await getLotacoesCompletas()
  const columns = [
    { key: 'escola' as const, header: 'Escola' },
    { key: 'oficineiro' as const, header: 'Oficineiro' },
    { key: 'oficina' as const, header: 'Oficina' },
    { key: 'horasAula' as const, header: 'Carga Horária' },
  ]
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Escolas – Equipe da Unidade</h2>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
