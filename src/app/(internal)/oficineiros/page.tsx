import { getResumoOficineiros } from '@/lib/queries'
import OficineirosClient from './OficineirosClient'

export default async function OficeirosPage() {
  const data = await getResumoOficineiros()

  const formattedData = data.map((r, i) => ({
    ...r,
    oficineiroId: r.id,
    id: i + 1,
  }))

  return <OficineirosClient oficineirosData={formattedData} />
}
