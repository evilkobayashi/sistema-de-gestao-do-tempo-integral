'use server'

import { db } from '@/lib/db'
import { lotacoes, escolas, oficinas, oficineiros, turnos } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type CsvRow = {
  escola: string
  turno: string
  turma: string
  oficina: string
  oficineiro: string
  horasAula: number
  horasPlanejamento: number
  dias: string
}

function checkDayOverlap(dias1: string, dias2: string): boolean {
  const normalize = (d: string) =>
    d.toLowerCase()
     .split(/[/,.\s-]+/)
     .map((day) => day.trim())
     .filter(Boolean)

  const days1 = normalize(dias1)
  const days2 = normalize(dias2)

  return days1.some((d1) => days2.some((d2) => d1.includes(d2) || d2.includes(d1)))
}

export async function importLotacoes(rows: CsvRow[]) {
  const errors: { row: number; data: CsvRow; error: string }[] = []
  let successCount = 0

  // 1. Fetch all lookups to resolve in memory
  const allEscolas = await db.select().from(escolas)
  const allOficinas = await db.select().from(oficinas)
  const allOficineiros = await db.select().from(oficineiros)
  const allTurnos = await db.select().from(turnos)

  // Maps to resolve by name (case-insensitive)
  const escolaMap = new Map<string, number>(allEscolas.map((e) => [e.nome.toLowerCase().trim(), e.id]))
  const oficinaMap = new Map<string, number>(allOficinas.map((o) => [o.nome.toLowerCase().trim(), o.id]))
  const oficineiroMap = new Map<string, number>(allOficineiros.map((o) => [o.nome.toLowerCase().trim(), o.id]))
  const turnoMap = new Map<string, number>(allTurnos.map((t) => [t.nome.toLowerCase().trim(), t.id]))

  // Helper helper to get or create lookups
  async function getOrCreateEscola(name: string): Promise<number> {
    const key = name.toLowerCase().trim()
    if (escolaMap.has(key)) return escolaMap.get(key)!
    const [inserted] = await db.insert(escolas).values({ nome: name.trim() }).returning({ id: escolas.id })
    escolaMap.set(key, inserted.id)
    return inserted.id
  }

  async function getOrCreateOficina(name: string): Promise<number> {
    const key = name.toLowerCase().trim()
    if (oficinaMap.has(key)) return oficinaMap.get(key)!
    const [inserted] = await db.insert(oficinas).values({ nome: name.trim() }).returning({ id: oficinas.id })
    oficinaMap.set(key, inserted.id)
    return inserted.id
  }

  async function getOrCreateOficineiro(name: string): Promise<number> {
    const key = name.toLowerCase().trim()
    if (oficineiroMap.has(key)) return oficineiroMap.get(key)!
    const [inserted] = await db.insert(oficineiros).values({ nome: name.trim() }).returning({ id: oficineiros.id })
    oficineiroMap.set(key, inserted.id)
    return inserted.id
  }

  // Workload tracking in-memory for this batch + database
  const oficineiroWorkloads = new Map<number, number>()
  const oficineiroAllocations = new Map<number, Array<{ turnoId: number; dias: string; escola: string; turma: string }>>()

  // Pre-load workloads and allocations from DB
  const dbLotacoes = await db
    .select({
      id: lotacoes.id,
      escolaId: lotacoes.escolaId,
      escola: escolas.nome,
      turnoId: lotacoes.turnoId,
      turno: turnos.nome,
      turma: lotacoes.turma,
      oficineiroId: lotacoes.oficineiroId,
      horasAula: lotacoes.horasAula,
      horasPlanejamento: lotacoes.horasPlanejamento,
      dias: lotacoes.dias,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .innerJoin(turnos, eq(lotacoes.turnoId, turnos.id))

  // Populate maps from database
  for (const alloc of dbLotacoes) {
    const w = oficineiroWorkloads.get(alloc.oficineiroId) || 0
    oficineiroWorkloads.set(alloc.oficineiroId, w + alloc.horasAula + alloc.horasPlanejamento)

    const list = oficineiroAllocations.get(alloc.oficineiroId) || []
    list.push({
      turnoId: alloc.turnoId,
      dias: alloc.dias,
      escola: alloc.escola,
      turma: alloc.turma,
    })
    oficineiroAllocations.set(alloc.oficineiroId, list)
  }

  // Process rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1

    try {
      const escolaName = String(row.escola || '').trim()
      const turnoName = String(row.turno || '').trim()
      const turmaName = String(row.turma || '').trim()
      const oficinaName = String(row.oficina || '').trim()
      const oficineiroName = String(row.oficineiro || '').trim()
      const horasAula = Number(row.horasAula || 0)
      const horasPlanejamento = Number(row.horasPlanejamento || 0)
      const dias = String(row.dias || '').trim()

      if (!escolaName || !turnoName || !turmaName || !oficinaName || !oficineiroName || !dias) {
        errors.push({ row: rowNum, data: row, error: 'Campos obrigatórios ausentes.' })
        continue
      }

      // Resolve turno
      const turnoKey = turnoName.toLowerCase()
      let turnoId = turnoMap.get(turnoKey)
      if (!turnoId) {
        if (turnoKey.includes('manh')) {
          turnoId = turnoMap.get('manhã')
        } else if (turnoKey.includes('tard')) {
          turnoId = turnoMap.get('tarde')
        } else if (turnoKey.includes('noit')) {
          turnoId = turnoMap.get('noite')
        }
      }
      if (!turnoId) {
        errors.push({ row: rowNum, data: row, error: `Turno "${turnoName}" inválido (Use Manhã, Tarde ou Noite).` })
        continue
      }

      // Resolve/Create other lookups
      const escolaId = await getOrCreateEscola(escolaName)
      const oficinaId = await getOrCreateOficina(oficinaName)
      const oficineiroId = await getOrCreateOficineiro(oficineiroName)

      // Check workload
      const novaCarga = horasAula + horasPlanejamento
      const cargaAtual = oficineiroWorkloads.get(oficineiroId) || 0
      if (cargaAtual + novaCarga > 40) {
        errors.push({
          row: rowNum,
          data: row,
          error: `Carga horária excederia o limite máximo de 40h (Carga acumulada: ${cargaAtual}h, tentou adicionar: ${novaCarga}h).`,
        })
        continue
      }

      // Check schedule conflict
      const allocs = oficineiroAllocations.get(oficineiroId) || []
      let conflict = false
      for (const a of allocs) {
        if (a.turnoId === turnoId && checkDayOverlap(a.dias, dias)) {
          errors.push({
            row: rowNum,
            data: row,
            error: `Conflito de horário: O oficineiro já está alocado no turno nos dias (${a.dias}) na Escola "${a.escola}" (Turma ${a.turma}).`,
          })
          conflict = true
          break
        }
      }
      if (conflict) continue

      // Insert Lotação
      await db.insert(lotacoes).values({
        escolaId,
        turnoId,
        turma: turmaName,
        oficinaId,
        oficineiroId,
        horasAula,
        horasPlanejamento,
        dias,
      })

      // Update in-memory trackers
      oficineiroWorkloads.set(oficineiroId, cargaAtual + novaCarga)
      allocs.push({
        turnoId,
        dias,
        escola: escolaName,
        turma: turmaName,
      })
      oficineiroAllocations.set(oficineiroId, allocs)
      successCount++

    } catch (err: any) {
      errors.push({ row: rowNum, data: row, error: `Erro interno: ${err.message}` })
    }
  }

  // Revalidate cache
  revalidatePath('/')
  revalidatePath('/lotacoes')
  revalidatePath('/oficineiros')
  revalidatePath('/escolas')
  revalidatePath('/resumo-escolas')
  revalidatePath('/resumo-oficineiros')
  revalidatePath('/relatorios')

  return {
    success: true,
    successCount,
    errorCount: errors.length,
    errors,
  }
}
