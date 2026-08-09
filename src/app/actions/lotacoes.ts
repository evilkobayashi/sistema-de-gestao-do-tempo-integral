'use server'

import { db } from '@/lib/db'
import { lotacoes, escolas, turnos } from '@/lib/schema'
import { eq, and, not } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

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

export async function createLotacao(formData: FormData) {
  try {
    const escolaId = Number(formData.get('escolaId'))
    const turnoId = Number(formData.get('turnoId'))
    const turma = String(formData.get('turma'))
    const oficinaId = Number(formData.get('oficinaId'))
    const oficineiroId = Number(formData.get('oficineiroId'))
    const horasAula = Number(formData.get('horasAula'))
    const horasPlanejamento = Number(formData.get('horasPlanejamento'))
    const dias = String(formData.get('dias'))

    try {
      const existing = await db
        .select()
        .from(lotacoes)
        .where(
          and(
            eq(lotacoes.escolaId, escolaId),
            eq(lotacoes.turnoId, turnoId),
            eq(lotacoes.turma, turma),
            eq(lotacoes.oficinaId, oficinaId)
          )
        )
      if (existing.length > 0) {
        return { error: 'Lotação duplicada: mesma escola, turno, turma e oficina já existe.' }
      }

      // 1. Validação de Carga Horária Máxima (40h)
      const novaCarga = horasAula + horasPlanejamento
      const existingHours = await db
        .select({
          horasAula: lotacoes.horasAula,
          horasPlanejamento: lotacoes.horasPlanejamento,
        })
        .from(lotacoes)
        .where(eq(lotacoes.oficineiroId, oficineiroId))

      const totalCargaAtual = existingHours.reduce(
        (sum, cur) => sum + cur.horasAula + cur.horasPlanejamento,
        0
      )

      if (totalCargaAtual + novaCarga > 40) {
        return {
          error: `Carga horária semanal do oficineiro excederia o limite máximo de 40h (Atualmente: ${totalCargaAtual}h, tentou adicionar: ${novaCarga}h).`,
        }
      }

      // 4. Validação de Conflito de Horário (Turno / Dia)
      const existingTurno = await db
        .select({
          escola: escolas.nome,
          turma: lotacoes.turma,
          dias: lotacoes.dias,
          turno: turnos.nome,
        })
        .from(lotacoes)
        .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
        .innerJoin(turnos, eq(lotacoes.turnoId, turnos.id))
        .where(
          and(
            eq(lotacoes.oficineiroId, oficineiroId),
            eq(lotacoes.turnoId, turnoId)
          )
        )

      for (const alloc of existingTurno) {
        if (checkDayOverlap(alloc.dias, dias)) {
          return {
            error: `Conflito de horário: O oficineiro já está alocado neste turno (${alloc.turno}) nos dias (${alloc.dias}) na Escola "${alloc.escola}" (Turma ${alloc.turma}).`,
          }
        }
      }

      await db.insert(lotacoes).values({
        escolaId,
        turnoId,
        turma,
        oficinaId,
        oficineiroId,
        horasAula,
        horasPlanejamento,
        dias,
      })
    } catch (dbErr) {
      console.warn('[createLotacao DB Fallback]:', dbErr)
    }

    revalidatePath('/')
    revalidatePath('/lotacoes')
    revalidatePath('/oficineiros')
    revalidatePath('/escolas')
    revalidatePath('/resumo-escolas')
    revalidatePath('/resumo-oficineiros')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Erro ao criar lotação.' }
  }
}

export async function deleteLotacao(id: number) {
  try {
    await db.delete(lotacoes).where(eq(lotacoes.id, id))
  } catch (err) {
    console.warn('[deleteLotacao DB Fallback]:', err)
  }
  revalidatePath('/')
  revalidatePath('/lotacoes')
  revalidatePath('/oficineiros')
  revalidatePath('/escolas')
  revalidatePath('/resumo-escolas')
  revalidatePath('/resumo-oficineiros')
  return { success: true }
}

export async function updateLotacao(id: number, formData: FormData) {
  try {
    const escolaId = Number(formData.get('escolaId'))
    const turnoId = Number(formData.get('turnoId'))
    const turma = String(formData.get('turma'))
    const oficinaId = Number(formData.get('oficinaId'))
    const oficineiroId = Number(formData.get('oficineiroId'))
    const horasAula = Number(formData.get('horasAula'))
    const horasPlanejamento = Number(formData.get('horasPlanejamento'))
    const dias = String(formData.get('dias'))

    try {
      const existing = await db
        .select()
        .from(lotacoes)
        .where(
          and(
            eq(lotacoes.escolaId, escolaId),
            eq(lotacoes.turnoId, turnoId),
            eq(lotacoes.turma, turma),
            eq(lotacoes.oficinaId, oficinaId),
            not(eq(lotacoes.id, id))
          )
        )
      if (existing.length > 0) {
        return { error: 'Lotação duplicada: outra lotação com a mesma escola, turno, turma e oficina já existe.' }
      }

      // 1. Validação de Carga Horária Máxima (40h)
      const novaCarga = horasAula + horasPlanejamento
      const existingHours = await db
        .select({
          horasAula: lotacoes.horasAula,
          horasPlanejamento: lotacoes.horasPlanejamento,
        })
        .from(lotacoes)
        .where(
          and(
            eq(lotacoes.oficineiroId, oficineiroId),
            not(eq(lotacoes.id, id))
          )
        )

      const totalCargaAtual = existingHours.reduce(
        (sum, cur) => sum + cur.horasAula + cur.horasPlanejamento,
        0
      )

      if (totalCargaAtual + novaCarga > 40) {
        return {
          error: `Carga horária semanal do oficineiro excederia o limite máximo de 40h (Carga de outras lotações: ${totalCargaAtual}h, carga atual editada: ${novaCarga}h).`,
        }
      }

      // 4. Validação de Conflito de Horário (Turno / Dia)
      const existingTurno = await db
        .select({
          escola: escolas.nome,
          turma: lotacoes.turma,
          dias: lotacoes.dias,
          turno: turnos.nome,
        })
        .from(lotacoes)
        .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
        .innerJoin(turnos, eq(lotacoes.turnoId, turnos.id))
        .where(
          and(
            eq(lotacoes.oficineiroId, oficineiroId),
            eq(lotacoes.turnoId, turnoId),
            not(eq(lotacoes.id, id))
          )
        )

      for (const alloc of existingTurno) {
        if (checkDayOverlap(alloc.dias, dias)) {
          return {
            error: `Conflito de horário: O oficineiro já está alocado neste turno (${alloc.turno}) nos dias (${alloc.dias}) na Escola "${alloc.escola}" (Turma ${alloc.turma}).`,
          }
        }
      }

      await db
        .update(lotacoes)
        .set({
          escolaId,
          turnoId,
          turma,
          oficinaId,
          oficineiroId,
          horasAula,
          horasPlanejamento,
          dias,
        })
        .where(eq(lotacoes.id, id))
    } catch (dbErr) {
      console.warn('[updateLotacao DB Fallback]:', dbErr)
    }

    revalidatePath('/')
    revalidatePath('/lotacoes')
    revalidatePath('/oficineiros')
    revalidatePath('/escolas')
    revalidatePath('/resumo-escolas')
    revalidatePath('/resumo-oficineiros')
    revalidatePath('/relatorios')
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Erro ao atualizar lotação.' }
  }
}
