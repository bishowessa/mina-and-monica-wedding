'use server'

import { cookies } from 'next/headers'
import { ADMIN_COOKIE, adminCookieValue, adminPassword, passwordsMatch } from '@/lib/admin-auth'

export type UnlockAdminResult = { ok: true } | { ok: false; error: string }

export async function unlockAdmin(password: string): Promise<UnlockAdminResult> {
  const expected = adminPassword()
  if (!expected) {
    return { ok: false, error: 'أضف ADMIN_PASSWORD في ملف .env ثم أعد تشغيل الموقع.' }
  }

  if (!passwordsMatch(password, expected)) {
    return { ok: false, error: 'كلمة المرور غير صحيحة.' }
  }

  const jar = await cookies()
  jar.set(ADMIN_COOKIE, adminCookieValue(expected), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return { ok: true }
}

export async function lockAdmin() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
}
