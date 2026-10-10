'use server'

import { prisma } from '@/lib/prisma'

const NAME_MAX = 80
const MESSAGE_MAX = 600

export type CreateAutographResult = { ok: true } | { ok: false; error: string }

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

  try {
    await prisma.autograph.create({
      data: { name, message },
    })
    return { ok: true }
  } catch {
    console.error('Failed to save autograph')
    return { ok: false, error: 'تعذر حفظ الرسالة. حاول مرة أخرى.' }
  }
}
