import type { Metadata } from 'next'
import AdminLogin from '@/components/AdminLogin'
import AutographWall from '@/components/AutographWall'
import { adminPassword, isAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'الأوتوجراف',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const configured = adminPassword().length > 0
  const allowed = await isAdmin()

  if (!allowed) {
    return <AdminLogin configured={configured} />
  }

  const rows = await prisma.autograph.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, message: true, createdAt: true },
  })

  return (
    <AutographWall
      autographs={rows.map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        createdAt: row.createdAt.toISOString(),
      }))}
    />
  )
}
