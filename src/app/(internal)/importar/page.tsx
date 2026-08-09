import ImportarClient from './ImportarClient'

export const metadata = {
  title: 'Importar Lotações — Tempo Integral',
  description: 'Importação de dados via planilha CSV',
}

export default function ImportarPage() {
  return <ImportarClient />
}
