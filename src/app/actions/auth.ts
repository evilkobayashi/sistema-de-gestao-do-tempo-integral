'use server'


import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { usuarios } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function loginAction(formData: FormData) {
  const email = formData.get('email')?.toString().trim()
  const senha = formData.get('senha')?.toString()

  if (!email || !senha) {
    return { error: 'Preencha o e-mail e a senha.' }
  }

  // ponytail: direct query check
  const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email))

  if (!user || user.senha !== senha) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('gti_session', JSON.stringify({ id: user.id, nome: user.nome, email: user.email, cargo: user.cargo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })

  redirect('/dashboard-executivo')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('gti_session')
  redirect('/login')
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('gti_session')
  if (!sessionCookie?.value) return null
  try {
    return JSON.parse(sessionCookie.value) as { id: number; nome: string; email: string; cargo: string }
  } catch {
    return null
  }
}
