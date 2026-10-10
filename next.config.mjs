import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    unoptimized: true,
  },
  // This repo lives beside other apps, so Turbopack must not walk up to F:\Projects.
  turbopack: {
    root,
  },
}

export default nextConfig
