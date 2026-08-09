import { getLookups } from '@/lib/queries'
import ConfiguracoesClient from './ConfiguracoesClient'

export default async function ConfiguracoesPage() {
  const { escolas, oficinas, oficineiros } = await getLookups()
  return <ConfiguracoesClient escolas={escolas} oficinas={oficinas} oficineiros={oficineiros} />
}
