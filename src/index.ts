import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import fs from 'fs'
import { join } from 'path'
import { getLocalKV, putLocalKV } from './kvMock.ts'

// FIXED: Import the decoupled route layer with explicit strict ESM extension
import { adminRoutes } from './admin/routes.ts'

const app = new Hono()

// Database Getter/Setter Actions abstraction layers
async function getDataset(c: any) {
  if (c.env && c.env.BROTHERS_KV) {
    const data = await c.env.BROTHERS_KV.get('site_data')
    return JSON.parse(data || '{}')
  }
  return JSON.parse(await getLocalKV())
}

async function saveDataset(c: any, data: any) {
  const jsonString = JSON.stringify(data, null, 2)
  if (c.env && c.env.BROTHERS_KV) {
    await c.env.BROTHERS_KV.put('site_data', jsonString)
    return
  }
  await putLocalKV(jsonString)
}

// Global Middleware Context Hook: Injects system utility configurations safely into admin scopes
app.use('*', async (c, next) => {
  c.env = {
    ...c.env,
    getDatasetHelper: getDataset,
    saveDatasetHelper: saveDataset,
    serveHtmlHelper: (ctx: any, filename: string) => {
      return ctx.html(fs.readFileSync(join(process.cwd(), 'public', filename), 'utf-8'))
    }
  }
  await next()
})

// ----------------- PUBLIC CORE SITE ENDPOINTS -----------------
app.get('/api/content', async (c) => {
  return c.json(await getDataset(c))
})

const serveHtml = (filename: string) => (c: any) => {
  try {
    return c.html(fs.readFileSync(join(process.cwd(), 'public', filename), 'utf-8'))
  } catch {
    return c.text(`${filename} template asset unreadable.`, 404)
  }
}

app.get('/', serveHtml('index.html'))
app.get('/about', serveHtml('about.html'))
app.get('/admission-details', serveHtml('admission-details.html'))

// ----------------- SUB-ROUTER MOUNT -----------------
// Mount all administrative endpoints cleanly from the admin folder module
app.route('/admin', adminRoutes)

// Start runtime engine


// Existing serve configurations remain completely intact for local Termux execution
const port = Number(process.env.PORT) || 3000
console.log(`\n🔥 Architecture Decoupled & Active at http://localhost:${port}`)
serve({ fetch: app.fetch, port })

// ADD THIS LINE FOR CLOUDFLARE CLOUD RESOLUTION:
export default app