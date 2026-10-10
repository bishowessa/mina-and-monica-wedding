import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'autograph_admin'

function digest(value: string) {
  return createHash('sha256').update(value).digest()
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? ''
}

export function passwordsMatch(input: string, expected: string) {
  return timingSafeEqual(digest(input), digest(expected))
}

export function adminCookieValue(password: string) {
  return createHash('sha256').update(`autographs:${password}`).digest('hex')
}

export async function isAdmin() {
  const password = adminPassword()
  if (!password) return false

  const jar = await cookies()
  const value = jar.get(ADMIN_COOKIE)?.value
  if (!value) return false

  return passwordsMatch(value, adminCookieValue(password))
}
