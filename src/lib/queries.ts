import { db } from './db'
import { lotacoes, escolas, oficinas, oficineiros, turnos } from './schema'
import { eq, sql } from 'drizzle-orm'

export async function getKpis() {
  const rows = await db
    .select({
      escolaId: lotacoes.escolaId,
      oficineiroId: lotacoes.oficineiroId,
      oficinaId: lotacoes.oficinaId,
      turnoId: lotacoes.turnoId,
      turma: lotacoes.turma,
      horasAula: lotacoes.horasAula,
      horasPlanejamento: lotacoes.horasPlanejamento,
    })
    .from(lotacoes)

  const escolasCount = new Set(rows.map((r) => r.escolaId)).size
  const oficineirosCount = new Set(rows.map((r) => r.oficineiroId)).size
  const oficinasCount = new Set(rows.map((r) => r.oficinaId)).size
  const turmasCount = new Set(rows.map((r) => `${r.escolaId}-${r.turnoId}-${r.turma}`)).size
  const horasAula = rows.reduce((s, r) => s + r.horasAula, 0)
  const horasPlanejamento = rows.reduce((s, r) => s + r.horasPlanejamento, 0)

  return {
    escolasCount,
    oficineirosCount,
    oficinasCount,
    turmasCount,
    horasAula,
    horasPlanejamento,
    cargaTotal: horasAula + horasPlanejamento,
  }
}

export async function getCargaHorariaPorEscola() {
  return db
    .select({
      escola: escolas.nome,
      total: sql<number>`sum(${lotacoes.horasAula} + ${lotacoes.horasPlanejamento})`,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .groupBy(escolas.nome)
    .orderBy(sql`sum(${lotacoes.horasAula} + ${lotacoes.horasPlanejamento}) desc`)
}

export async function getOficinasPorEscola() {
  return db
    .select({
      escola: escolas.nome,
      count: sql<number>`count(distinct ${lotacoes.oficinaId})`,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .groupBy(escolas.nome)
}

export async function getCargaHorariaPorOfineiro() {
  return db
    .select({
      oficineiro: oficineiros.nome,
      total: sql<number>`sum(${lotacoes.horasAula} + ${lotacoes.horasPlanejamento})`,
    })
    .from(lotacoes)
    .innerJoin(oficineiros, eq(lotacoes.oficineiroId, oficineiros.id))
    .groupBy(oficineiros.nome)
}

export async function getTurmasPorTurno() {
  return db
    .select({
      turno: turnos.nome,
      count: sql<number>`count(distinct ${lotacoes.turma})`,
    })
    .from(lotacoes)
    .innerJoin(turnos, eq(lotacoes.turnoId, turnos.id))
    .groupBy(turnos.nome)
}

export async function getLotacoesCompletas() {
  return db
    .select({
      id: lotacoes.id,
      escola: escolas.nome,
      escolaId: lotacoes.escolaId,
      turno: turnos.nome,
      turnoId: lotacoes.turnoId,
      turma: lotacoes.turma,
      oficina: oficinas.nome,
      oficinaId: lotacoes.oficinaId,
      oficineiro: oficineiros.nome,
      oficineiroId: lotacoes.oficineiroId,
      horasAula: lotacoes.horasAula,
      horasPlanejamento: lotacoes.horasPlanejamento,
      dias: lotacoes.dias,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .innerJoin(turnos, eq(lotacoes.turnoId, turnos.id))
    .innerJoin(oficinas, eq(lotacoes.oficinaId, oficinas.id))
    .innerJoin(oficineiros, eq(lotacoes.oficineiroId, oficineiros.id))
    .orderBy(escolas.nome, turnos.nome, lotacoes.turma)
}

export async function getResumoEscolas() {
  return db
    .select({
      escola: escolas.nome,
      nOficinas: sql<number>`count(distinct ${lotacoes.oficinaId})`,
      nOficineiros: sql<number>`count(distinct ${lotacoes.oficineiroId})`,
      horasAula: sql<number>`sum(${lotacoes.horasAula})`,
      turmas: sql<number>`count(distinct ${lotacoes.turma})`,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .groupBy(escolas.nome)
    .orderBy(escolas.nome)
}

export async function getResumoOficineiros() {
  return db
    .select({
      id: oficineiros.id,
      oficineiro: oficineiros.nome,
      oficina: sql<string>`coalesce(${oficinas.nome}, 'Nenhuma')`,
      cargaTotal: sql<number>`coalesce(sum(${lotacoes.horasAula} + ${lotacoes.horasPlanejamento}), 0)`,
      horasAula: sql<number>`coalesce(sum(${lotacoes.horasAula}), 0)`,
      horasPlanejamento: sql<number>`coalesce(sum(${lotacoes.horasPlanejamento}), 0)`,
    })
    .from(oficineiros)
    .leftJoin(lotacoes, eq(lotacoes.oficineiroId, oficineiros.id))
    .leftJoin(oficinas, eq(lotacoes.oficinaId, oficinas.id))
    .groupBy(oficineiros.id, oficineiros.nome, oficinas.nome)
    .orderBy(oficineiros.nome)
}

export async function getLookups() {
  const [allEscolas, allOficinas, allOficineiros, allTurnos] = await Promise.all([
    db.select().from(escolas).orderBy(escolas.nome),
    db.select().from(oficinas).orderBy(oficinas.nome),
    db.select().from(oficineiros).orderBy(oficineiros.nome),
    db.select().from(turnos),
  ])
  return { escolas: allEscolas, oficinas: allOficinas, oficineiros: allOficineiros, turnos: allTurnos }
}
