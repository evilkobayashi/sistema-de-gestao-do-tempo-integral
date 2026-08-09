import { getLotacoesCompletas, getLookups } from '@/lib/queries'
import DashboardClient from '@/app/DashboardClient'



export default async function DashboardPage() {
  const [lotacoes, lookups] = await Promise.all([
    getLotacoesCompletas(),
    getLookups(),
  ])

  return (
    <DashboardClient
      lotacoes={lotacoes}
      escolas={lookups.escolas}
      turnos={lookups.turnos}
    />
  )
}
