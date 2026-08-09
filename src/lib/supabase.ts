import { createClient } from '@supabase/supabase-js'

// ponytail: cliente Supabase utilizando os padrões modernos de Publishable Key e Secret Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ovehjqfxamdvixckpwjm.supabase.co'
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_pub_placeholder'
const secretKey = process.env.SUPABASE_SECRET_KEY

// Cliente público para o navegador / Client Components
export const supabase = createClient(supabaseUrl, publishableKey)

// Cliente administrativo servidor (Server Actions / Backend)
export const supabaseAdmin = createClient(supabaseUrl, secretKey || publishableKey, {
  auth: { persistSession: false },
})

export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('escolas').select('count', { count: 'exact', head: true })
    if (error) return { connected: false, message: error.message }
    return { connected: true, message: 'Conectado ao Supabase Cloud (sa-east-1)' }
  } catch (err: any) {
    return { connected: false, message: err.message || 'Erro ao conectar ao Supabase' }
  }
}
