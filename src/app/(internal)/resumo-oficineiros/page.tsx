import DataTable from '@/components/ui/DataTable'
import { getResumoOficineiros } from '@/lib/queries'

export default async function ResumoOficeirosPage() {
  const data = await getResumoOficineiros()
  const columns = [
    { key: 'oficineiro' as const, header: 'Oficineiro' },
    { key: 'oficina' as const, header: 'Oficina' },
    { key: 'cargaTotal' as const, header: 'CH Total' },
    { key: 'horasAula' as const, header: 'CH Aula' },
    { key: 'horasPlanejamento' as const, header: 'CH Plan.' },
  ]
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Resumo dos Oficineiros</h2>
      <p className="text-xs text-gray-400">* Carga máxima: 40h semanais</p>
      <DataTable columns={columns} data={data.map((r, i) => ({ ...r, id: i + 1 }))} />
    </div>
  )
}
