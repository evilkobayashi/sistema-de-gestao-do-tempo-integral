'use server'

import { db } from '@/lib/db'
import { escolas, oficinas, oficineiros } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createEscola(formData: FormData) {
  await db.insert(escolas).values({ nome: String(formData.get('nome')) })
  revalidatePath('/configuracoes')
  revalidatePath('/lotacoes')
}

export async function deleteEscola(id: number) {
  try {
    await db.delete(escolas).where(eq(escolas.id, id))
    revalidatePath('/configuracoes')
    revalidatePath('/lotacoes')
    return { success: true }
  } catch (error: any) {
    if (error.message?.includes('FOREIGN KEY') || error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return { error: 'Não é possível excluir esta escola porque ela está associada a uma ou mais lotações.' }
    }
    return { error: 'Erro inesperado ao excluir a escola.' }
  }
}

export async function createOficina(formData: FormData) {
  await db.insert(oficinas).values({ nome: String(formData.get('nome')) })
  revalidatePath('/configuracoes')
  revalidatePath('/lotacoes')
}

export async function deleteOficina(id: number) {
  try {
    await db.delete(oficinas).where(eq(oficinas.id, id))
    revalidatePath('/configuracoes')
    revalidatePath('/lotacoes')
    return { success: true }
  } catch (error: any) {
    if (error.message?.includes('FOREIGN KEY') || error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return { error: 'Não é possível excluir esta oficina porque ela está associada a uma ou mais lotações.' }
    }
    return { error: 'Erro inesperado ao excluir a oficina.' }
  }
}

export async function createOfineiro(formData: FormData) {
  await db.insert(oficineiros).values({ nome: String(formData.get('nome')) })
  revalidatePath('/configuracoes')
  revalidatePath('/lotacoes')
}

export async function deleteOfineiro(id: number) {
  try {
    await db.delete(oficineiros).where(eq(oficineiros.id, id))
    revalidatePath('/configuracoes')
    revalidatePath('/lotacoes')
    return { success: true }
  } catch (error: any) {
    if (error.message?.includes('FOREIGN KEY') || error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return { error: 'Não é possível excluir este oficineiro porque ele está associado a uma ou mais lotações.' }
    }
    return { error: 'Erro inesperado ao excluir o oficineiro.' }
  }
}
