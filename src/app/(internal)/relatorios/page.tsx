import { getLotacoesCompletas } from '@/lib/queries'
import RelatoriosClient from './RelatoriosClient'

export default async function RelatoriosPage() {
  const lotacoes = await getLotacoesCompletas()
  return <RelatoriosClient lotacoes={lotacoes} />
}
