import { db } from './db'
import { turnos, escolas, oficinas, oficineiros, lotacoes } from './schema'

async function main() {
  console.log('Iniciando o seed do banco de dados...')

  // 1. Seed de Turnos (obrigatório para o sistema funcionar)
  const existingTurnos = await db.select().from(turnos)
  if (existingTurnos.length === 0) {
    console.log('Semeando turnos...')
    await db.insert(turnos).values([
      { nome: 'Manhã' },
      { nome: 'Tarde' },
      { nome: 'Noite' }
    ])
  } else {
    console.log('Turnos já existentes no banco.')
  }

  // 2. Seed de Escolas (apenas se vazio)
  const existingEscolas = await db.select().from(escolas)
  let seededEscolaIds: number[] = existingEscolas.map((e) => e.id)
  if (existingEscolas.length === 0) {
    console.log('Semeando escolas de demonstração...')
    const inserted = await db.insert(escolas).values([
      { nome: 'E. M. Castelo Branco' },
      { nome: 'E. M. Santo Antônio' },
      { nome: 'C. M. Professora Maria Santíssima' },
    ]).returning({ id: escolas.id })
    seededEscolaIds = inserted.map((i) => i.id)
  }

  // 3. Seed de Oficinas (apenas se vazio)
  const existingOficinas = await db.select().from(oficinas)
  let seededOficinaIds: number[] = existingOficinas.map((o) => o.id)
  if (existingOficinas.length === 0) {
    console.log('Semeando oficinas de demonstração...')
    const inserted = await db.insert(oficinas).values([
      { nome: 'Robótica' },
      { nome: 'Teatro e Expressão Corporal' },
      { nome: 'Dança Moderna' },
      { nome: 'Xadrez e Raciocínio Lógico' },
      { nome: 'Música (Violão/Flauta)' },
    ]).returning({ id: oficinas.id })
    seededOficinaIds = inserted.map((i) => i.id)
  }

  // 4. Seed de Oficineiros (apenas se vazio)
  const existingOficineiros = await db.select().from(oficineiros)
  let seededOficineiroIds: number[] = existingOficineiros.map((o) => o.id)
  if (existingOficineiros.length === 0) {
    console.log('Semeando oficineiros de demonstração...')
    const inserted = await db.insert(oficineiros).values([
      { nome: 'Carlos Eduardo Souza' },
      { nome: 'Mariana de Oliveira Silva' },
      { nome: 'Roberto Albuquerque' },
      { nome: 'Ana Paula Costa' },
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
        turma: '101-A',
        oficinaId: seededOficinaIds[0], // Robótica
        oficineiroId: seededOficineiroIds[0], // Carlos
        horasAula: 8,
        horasPlanejamento: 2,
        dias: 'Seg/Qua',
      },
      {
        escolaId: seededEscolaIds[0],
        turnoId: turnoTarde,
        turma: '201-B',
        oficinaId: seededOficinaIds[1], // Teatro
        oficineiroId: seededOficineiroIds[1], // Mariana
        horasAula: 12,
        horasPlanejamento: 3,
        dias: 'Ter/Qui',
      },
      {
        escolaId: seededEscolaIds[1],
        turnoId: turnoManha,
        turma: '301-C',
        oficinaId: seededOficinaIds[3], // Xadrez
        oficineiroId: seededOficineiroIds[2], // Roberto
        horasAula: 6,
        horasPlanejamento: 2,
        dias: 'Sex',
      },
    ])
  }

  // 6. Seed de Usuários (apenas se vazio)
  const { usuarios } = await import('./schema')
  const existingUsuarios = await db.select().from(usuarios)
  if (existingUsuarios.length === 0) {
    console.log('Semeando usuários de demonstração...')
    await db.insert(usuarios).values([
      {
        nome: 'Administrador SME',
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

  console.log('Seed do banco de dados concluído com sucesso!')

}

main().catch((err) => {
  console.error('Erro ao semear o banco de dados:', err)
  process.exit(1)
})
