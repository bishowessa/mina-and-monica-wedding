'use server'

import type { AutographListResult, CreateAutographResult } from '@/lib/autographs'
import { getSupabase } from '@/lib/supabase'

const NAME_MAX = 80
const MESSAGE_MAX = 600

export async function getAutographs(): Promise<AutographListResult> {
  const supabase = getSupabase()
  if (!supabase) return { ok: true, autographs: [] }

  const { data, error } = await supabase
    .from('Autographs')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load autographs:', error.message)
    return { ok: false, error: 'تعذر تحميل الأسماء.' }
  }

  return { ok: true, autographs: data ?? [] }
}

export async function createAutograph(input: {
  name: string
  message: string
}): Promise<CreateAutographResult> {
  const name = input.name.trim()
  const message = input.message.trim()

  if (!name || !message) {
    return { ok: false, error: 'الاسم والرسالة مطلوبان.' }
  }

  if (name.length > NAME_MAX || message.length > MESSAGE_MAX) {
    return { ok: false, error: 'الرسالة أطول من المسموح.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return { ok: false, error: 'تعذر إرسال الرسالة الآن.' }
  }

  const { error } = await supabase.from('Autographs').insert({ name, message })

  if (error) {
    console.error('Failed to save autograph:', error.message)
    return { ok: false, error: 'تعذر حفظ الرسالة. حاول مرة أخرى.' }
  }

  return { ok: true }
}
