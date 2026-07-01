import app from './index.ts'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { serve } from '@hono/node-server'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
}

app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/admin')) return next()
  let fp = join(process.cwd(), 'public', c.req.path === '/' ? 'index.html' : c.req.path)
  try {
    if (statSync(fp).isDirectory()) fp = join(fp, 'index.html')
    if (!existsSync(fp)) return c.notFound()
    return new Response(readFileSync(fp), {
      headers: { 'Content-Type': MIME[extname(fp)] || 'application/octet-stream' }
    })
  } catch { return c.notFound() }
})

serve({ fetch: app.fetch, port: 3000 }, (i: { port: number }) => {
  console.log(`\n🚀 Brothers' Tutorial — http://localhost:${i.port}`)
  console.log(`   ➜  Admin: http://localhost:${i.port}/admin?token=brothers_academic_secret_2026\n`)
})
