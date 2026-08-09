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

export async function registerAction(formData: FormData) {
  const nome = formData.get('nome')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const senha = formData.get('senha')?.toString()
  const confirmarSenha = formData.get('confirmarSenha')?.toString()
  const cargo = formData.get('cargo')?.toString() || 'gestor'
  const escolaIdRaw = formData.get('escolaId')?.toString()

  if (!nome || !email || !senha || !confirmarSenha) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  if (senha !== confirmarSenha) {
    return { error: 'As senhas não coincidem.' }
  }

  if (senha.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  // Check existing email
  const [existingUser] = await db.select().from(usuarios).where(eq(usuarios.email, email))
  if (existingUser) {
    return { error: 'Este e-mail já está cadastrado no sistema.' }
  }

  const escolaId = escolaIdRaw ? Number(escolaIdRaw) : null

  // Insert new user
  const [newUser] = await db
    .insert(usuarios)
    .values({
      nome,
      email,
      senha,
      cargo,
      escolaId,
    })
    .returning({ id: usuarios.id })

  const cookieStore = await cookies()
  cookieStore.set('gti_session', JSON.stringify({ id: newUser.id, nome, email, cargo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
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

