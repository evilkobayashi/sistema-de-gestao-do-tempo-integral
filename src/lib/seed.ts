import { db } from './db'
import { turnos, escolas, oficinas, oficineiros, lotacoes } from './schema'

const ESCOLAS_QUEIMADOS = [
  // Creches Municipais
  { nome: 'Creche M. Clotildes Martins Lemos' },
  { nome: 'Creche M. Iracema Garcia' },
  { nome: 'Creche M. Prof.ª Vanda Gonçalves Faria Ferreira' },
  { nome: 'Creche M. Ver. Gilberto Peres de Oliveira' },
  { nome: 'Creche M. Prof.ª Ana Claudia do Carmo' },

  // Escolas Municipais
  { nome: 'E. M. Allan Kardec' },
  { nome: 'E. M. Aníbal Viriato de Castro' },
  { nome: 'E. M. Castelo Branco' },
  { nome: 'E. M. Dr. Cledon Cavalcante' },
  { nome: 'E. M. Dr. Francisco Manoel Brandão' },
  { nome: 'E. M. Eloi Dias Teixeira' },
  { nome: 'E. M. José Anastácio Rodrigues' },
  { nome: 'E. M. José Bittencourt de Oliveira' },
  { nome: 'E. M. Luiz de Camões' },
  { nome: 'E. M. Metodista de Queimados' },
  { nome: 'E. M. Monteiro Lobato' },
  { nome: 'E. M. Oscar Weinschenck' },
  { nome: 'E. M. Pastor Arsênio Gonçalves' },
  { nome: 'E. M. Paulo Freire' },
  { nome: 'E. M. Prof.ª Diva Teixeira Martins' },
  { nome: 'E. M. Prof. Joaquim de Freitas' },
  { nome: 'E. M. Prof. Leopoldo Machado' },
  { nome: 'E. M. Prof.ª Scintilla Exel' },
  { nome: 'E. M. Prof. Ubirajara Ferreira' },
  { nome: 'E. M. Santo Antônio' },
  { nome: 'E. M. São José' },
  { nome: 'E. M. Senador Nelson Carneiro' },
  { nome: 'E. M. Waldick Cunegundes Pereira' },
]

async function main() {
  console.log('Iniciando o seed completo das escolas de Queimados RJ...')

  // 1. Seed de Turnos (obrigatório para o sistema funcionar)
  const existingTurnos = await db.select().from(turnos)
  if (existingTurnos.length === 0) {
    console.log('Semeando turnos...')
    await db.insert(turnos).values([
      { nome: 'Manhã' },
      { nome: 'Tarde' },
      { nome: 'Integral' },
    ])
  }

  // 2. Seed das Escolas e Creches de Queimados (reavalia ou insere)
  const existingEscolas = await db.select().from(escolas)
  let seededEscolaIds: number[] = existingEscolas.map((e) => e.id)
  if (existingEscolas.length < ESCOLAS_QUEIMADOS.length) {
    console.log('Semeando a lista completa de escolas e creches municipais de Queimados...')
    for (const esc of ESCOLAS_QUEIMADOS) {
      const exists = existingEscolas.some((e) => e.nome.toLowerCase() === esc.nome.toLowerCase())
      if (!exists) {
        const [inserted] = await db.insert(escolas).values(esc).returning({ id: escolas.id })
        if (inserted?.id) seededEscolaIds.push(inserted.id)
      }
    }
  }

  // 3. Seed de Oficinas (apenas se vazio)
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

  // 4. Seed de Oficineiros (apenas se vazio)
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

  // 5. Seed de Lotações de demonstração (apenas se vazio)
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

  console.log('Seed completo das 28 escolas e creches de Queimados concluído!')
}

main().catch((err) => {
  console.error('Erro ao semear o banco de dados:', err)
  process.exit(1)
})
