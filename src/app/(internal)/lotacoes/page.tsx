import { getLotacoesCompletas, getLookups } from '@/lib/queries'
import LotacoesClient from './LotacoesClient'

export default async function LotacoesPage() {
  const [lotacoes, lookups] = await Promise.all([
    getLotacoesCompletas(),
    getLookups(),
  ])
  return <LotacoesClient lotacoes={lotacoes} {...lookups} />
}
