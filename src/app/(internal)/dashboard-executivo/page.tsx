import { getLotacoesCompletas, getLookups, getKpis, getResumoOficineiros, getResumoEscolas } from '@/lib/queries'
import { getSessionUser } from '@/app/actions/auth'
import DashboardExecutivoClient from './DashboardExecutivoClient'

export default async function DashboardExecutivoPage() {
  const [lotacoes, lookups, kpis, resumoOficineiros, resumoEscolas, session] = await Promise.all([
    getLotacoesCompletas(),
    getLookups(),
    getKpis(),
    getResumoOficineiros(),
    getResumoEscolas(),
    getSessionUser(),
  ])

  return (
    <DashboardExecutivoClient
      lotacoes={lotacoes}
      escolas={lookups.escolas}
      turnos={lookups.turnos}
      kpis={kpis}
      resumoOficineiros={resumoOficineiros}
      resumoEscolas={resumoEscolas}
      sessionUser={session}
    />
  )
}
