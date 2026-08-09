import { db } from './db'
import { turnos, escolas, oficinas, oficineiros, lotacoes } from './schema'

const ESCOLAS_QUEIMADOS_42 = [
  // Creches Municipais
  { nome: 'Creche Municipal Clotildes Martins Lemos' },
  { nome: 'Creche Municipal Iracema Garcia' },
  { nome: 'Creche Municipal Professora Ana Claudia do Carmo' },
  { nome: 'Creche Municipal Professora Vanda Gonçalves Faria Ferreira' },
  { nome: 'Creche Municipal Vereador Gilberto Peres de Oliveira' },
  { nome: 'Creche Municipal Professora Vera Ribeiro Menezes' },
  { nome: 'Creche Municipal Dona Maria Santíssima' },
  { nome: 'Creche Municipal São Jorge' },

  // Escolas Municipais
  { nome: 'Escola Municipal Allan Kardec' },
  { nome: 'Escola Municipal Aníbal Viriato de Castro' },
  { nome: 'Escola Municipal Carlos Pereira Neto' },
  { nome: 'Escola Municipal Castelo Branco' },
  { nome: 'Escola Municipal Dr. Cledon Cavalcante' },
  { nome: 'Escola Municipal Dr. Francisco Manoel Brandão' },
  { nome: 'Escola Municipal Eloi Dias Teixeira' },
  { nome: 'Escola Municipal José Anastácio Rodrigues' },
  { nome: 'Escola Municipal José Bittencourt de Oliveira' },
  { nome: 'Escola Municipal José de Anchieta' },
  { nome: 'Escola Municipal Luiz de Camões' },
  { nome: 'Escola Municipal Metodista de Queimados' },
  { nome: 'Escola Municipal Monteiro Lobato' },
  { nome: 'Escola Municipal Oscar Weinschenck' },
  { nome: 'Escola Municipal Pastor Arsênio Gonçalves' },
  { nome: 'Escola Municipal Paulo Freire' },
  { nome: 'Escola Municipal Primeira Igreja Batista' },
  { nome: 'Escola Municipal Professor Alberto Pirro' },
  { nome: 'Escola Municipal Professor Diva Teixeira Martins' },
  { nome: 'Escola Municipal Professor Gilvanei Pereira da Fonseca' },
  { nome: 'Escola Municipal Professor Joaquim de Freitas' },
  { nome: 'Escola Municipal Professor Leopoldo Machado' },
  { nome: 'Escola Municipal Professor Ubirajara Ferreira' },
  { nome: 'Escola Municipal Professora Anna Maria dos Santos Perobelli' },
  { nome: 'Escola Municipal Professora Maria Coragio Pereira Xanchão' },
  { nome: 'Escola Municipal Professora Scintilla Exel' },
  { nome: 'Escola Municipal Santo Antônio' },
  { nome: 'Escola Municipal Santo Expedito' },
  { nome: 'Escola Municipal São José' },
  { nome: 'Escola Municipal Senador Nelson Carneiro' },
  { nome: 'Escola Municipal Tiradentes' },
  { nome: 'Escola Municipal Waldick Cunegundes Pereira' },

  // Centros Especializados de Educação
  { nome: 'Centro de Atendimento Educacional Especializado (CAEE)' },
  { nome: 'Centro de Educação a Distância de Queimados (CEADQ)' },
]

async function main() {
  console.log('Iniciando o seed completo das 42 escolas e creches de Queimados RJ...')

  // 1. Seed de Turnos
  const existingTurnos = await db.select().from(turnos)
  if (existingTurnos.length === 0) {
    console.log('Semeando turnos...')
    await db.insert(turnos).values([
      { nome: 'Manhã' },
      { nome: 'Tarde' },
      { nome: 'Integral' },
    ])
  }

  // 2. Seed das 42 Escolas e Creches de Queimados
  const existingEscolas = await db.select().from(escolas)
  let seededEscolaIds: number[] = existingEscolas.map((e) => e.id)
  
  console.log('Semeando a lista completa de 42 unidades escolares e creches municipais de Queimados...')
  for (const esc of ESCOLAS_QUEIMADOS_42) {
    const exists = existingEscolas.some((e) => e.nome.toLowerCase() === esc.nome.toLowerCase())
    if (!exists) {
      const [inserted] = await db.insert(escolas).values(esc).returning({ id: escolas.id })
      if (inserted?.id) seededEscolaIds.push(inserted.id)
    }
  }

  // 3. Seed de Oficinas
  const existingOficinas = await db.select().from(oficinas)
  let seededOficinaIds: number[] = existingOficinas.map((o) => o.id)
  if (existingOficinas.length === 0) {
    console.log('Semeando oficinas do programa tempo integral...')
    const inserted = await db.insert(oficinas).values([
      { nome: 'Robótica Educacional' },
      { nome: 'Letramento & Recomposição de Aprendizagem' },
      { nome: 'Raciocínio Lógico & Xadrez' },
      { nome: 'Cultura Digital & Mídia' },
      { nome: 'Teatro e Expressão Corporal' },
      { nome: 'Música (Violão e Flauta)' },
      { nome: 'Esporte Educacional & Capoeira' },
    ]).returning({ id: oficinas.id })
    seededOficinaIds = inserted.map((i) => i.id)
  }

  // 4. Seed de Oficineiros
  const existingOficineiros = await db.select().from(oficineiros)
  let seededOficineiroIds: number[] = existingOficineiros.map((o) => o.id)
  if (existingOficineiros.length === 0) {
    console.log('Semeando oficineiros...')
    const inserted = await db.insert(oficineiros).values([
      { nome: 'Carlos Eduardo Souza' },
      { nome: 'Mariana de Oliveira Silva' },
      { nome: 'Roberto Albuquerque Santos' },
      { nome: 'Ana Paula Costa' },
      { nome: 'Juliana Castro Ramos' },
    ]).returning({ id: oficineiros.id })
    seededOficineiroIds = inserted.map((i) => i.id)
  }

  // 5. Seed de Lotações de demonstração
  const existingLotacoes = await db.select().from(lotacoes)
  if (
    existingLotacoes.length === 0 &&
    seededEscolaIds.length > 0 &&
    seededOficinaIds.length > 0 &&
    seededOficineiroIds.length > 0
  ) {
    console.log('Semeando lotações de demonstração...')
    const tRows = await db.select().from(turnos)
    const turnoManha = tRows.find((t) => t.nome === 'Manhã')?.id || tRows[0]?.id
    const turnoTarde = tRows.find((t) => t.nome === 'Tarde')?.id || tRows[0]?.id

    await db.insert(lotacoes).values([
      {
        escolaId: seededEscolaIds[0],
        turnoId: turnoManha,
        turma: '5º Ano A',
        oficinaId: seededOficinaIds[0],
        oficineiroId: seededOficineiroIds[0],
        horasAula: 16,
        horasPlanejamento: 8,
        dias: 'Segunda, Quarta',
      },
      {
        escolaId: seededEscolaIds[1],
        turnoId: turnoTarde,
        turma: '6º Ano B',
        oficinaId: seededOficinaIds[1],
        oficineiroId: seededOficineiroIds[1],
        horasAula: 20,
        horasPlanejamento: 10,
        dias: 'Terça, Quinta',
      },
    ])
  }

  // 6. Seed de Usuários
  const { usuarios } = await import('./schema')
  const existingUsuarios = await db.select().from(usuarios)
  if (existingUsuarios.length === 0) {
    console.log('Semeando usuários padrão SME...')
    await db.insert(usuarios).values([
      {
        nome: 'Administrador SME Queimados',
        email: 'admin@sme.gov.br',
        senha: 'admin123',
        cargo: 'admin',
      },
      {
        nome: 'Gestor Escolar',
        email: 'gestor@escola.gov.br',
        senha: 'gestor123',
        cargo: 'gestor',
        escolaId: seededEscolaIds[0] || null,
      },
    ])
  }

  console.log('Seed completo das 42 escolas e creches de Queimados concluído!')
}

main().catch((err) => {
  console.error('Erro ao semear o banco de dados:', err)
  process.exit(1)
})
