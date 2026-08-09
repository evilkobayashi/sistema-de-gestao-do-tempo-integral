import { getLookups } from '@/lib/queries'
import FrequenciaClient from './FrequenciaClient'

export const dynamic = 'force-dynamic'

export default async function FrequenciaPage() {
  const { escolas, oficinas } = await getLookups()

  return <FrequenciaClient escolas={escolas} oficinas={oficinas} />
}
