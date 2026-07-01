import { Hono } from 'hono'

type Bindings = {
  BROTHERS_KV: KVNamespace
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_UPLOAD_PRESET: string
}
type Variables = { kv: any }

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const SECRET_TOKEN = 'brothers_academic_secret_2026'
const ADMIN_PASSWORD = 'admin123'

/* ═══════════════════════════════════════════════════
   LOGIN PAGE — pure HTML form, no JS needed to work
   ═══════════════════════════════════════════════════ */
function loginPage(showError: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Admin Login — Brothers' Tutorial</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={theme:{extend:{colors:{primary:'#1e3a5f',accent:'#f59e0b'}}}}</script>
</head>
<body class="bg-primary min-h-screen flex items-center justify-center p-4">
<div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
  <div class="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#1e3a5f" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
  </div>
  <h2 class="text-xl font-bold text-primary mb-1">Admin Access</h2>
  <p class="text-sm text-slate-500 mb-5">Enter the admin password to continue</p>
  ${showError ? '<p class="text-red-500 text-sm mb-3 font-medium">Incorrect password — try again</p>' : '<div class="h-6 mb-3"></div>'}
  <form method="POST" action="/admin">
    <input name="password" type="password" placeholder="Password" required autocomplete="off" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-accent mb-3">
    <button type="submit" class="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-semibold transition cursor-pointer">Unlock Dashboard</button>
  </form>
</div>
</body>
</html>`
}

/* ═══════════════════════════════════════════════════
   GET /admin — show login or dashboard
   ═══════════════════════════════════════════════════ */
admin.get('/', (c) => {
  const url = new URL(c.req.url)
  const token = url.searchParams.get('token')
  const isError = url.searchParams.get('error') === '1'

  if (token === SECRET_TOKEN) {
    return c.html(DASHBOARD_HTML)
  }
  return c.html(loginPage(isError))
})

/* ═══════════════════════════════════════════════════
   POST /admin — handle login (plain form, no token needed)
   Registered BEFORE the token gate so it bypasses it
   ═══════════════════════════════════════════════════ */
admin.post('/', async (c) => {
  const body = await c.req.parseBody()
  const password = typeof body.password === 'string' ? body.password : ''

  if (password === ADMIN_PASSWORD) {
    return c.redirect('/admin?token=' + SECRET_TOKEN)
  }
  return c.redirect('/admin?error=1')
})

/* ═══════════════════════════════════════════════════
   TOKEN GATE — everything after this requires token
   ═══════════════════════════════════════════════════ */
admin.use('*', async (c, next) => {
  const token = new URL(c.req.url).searchParams.get('token')
  if (token !== SECRET_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
})

/* ═══════════════════════════════════════════════════
   API: Fetch all data
   ═══════════════════════════════════════════════════ */
admin.get('/data', async (c) => {
  const kv = c.get('kv')
  const [landing, about, admission, alert, notices, downloads, carousel, hero, logo] = await Promise.all([
    kv.get('content:landing', { type: 'json' }),
    kv.get('content:about', { type: 'json' }),
    kv.get('content:admission', { type: 'json' }),
    kv.get('alerts:active', { type: 'json' }),
    kv.get('notices:list', { type: 'json' }),
    kv.get('downloads:list', { type: 'json' }),
    kv.get('media:carousel', { type: 'json' }),
    kv.get('media:hero', { type: 'json' }),
    kv.get('media:logo', { type: 'json' })
  ])
  return c.json({ landing, about, admission, alert, notices, downloads, carousel, hero, logo })
})

/* ═══════════════════════════════════════════════════
   API: Cloudinary upload
   ═══════════════════════════════════════════════════ */
admin.post('/upload', async (c) => {
  const kv = c.get('kv')
  const cn = c.env.CLOUDINARY_CLOUD_NAME || ''
  const up = c.env.CLOUDINARY_UPLOAD_PRESET || ''
  if (!cn || !up) return c.json({ error: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET env vars.' }, 500)

  const fd = await c.req.formData()
  const file = fd.get('file') as File | null
  const target = (fd.get('target') as string) || 'carousel'
  const caption = (fd.get('caption') as string) || ''
  if (!file) return c.json({ error: 'No file' }, 400)

  const cfd = new FormData()
  cfd.append('file', file)
  cfd.append('upload_preset', up)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cn}/image/upload`, { method: 'POST', body: cfd })
    const r = await res.json()
    if (!r.secure_url) throw new Error(r.error?.message || 'Upload failed')
    const url: string = r.secure_url

    if (target === 'hero') {
      await kv.put('media:hero', JSON.stringify({ url, caption }))
    } else if (target === 'logo') {
      await kv.put('media:logo', JSON.stringify({ url }))
    } else {
      const list: any[] = (await kv.get('media:carousel', { type: 'json' })) || []
      list.push({ id: crypto.randomUUID(), url, caption, order: list.length })
      await kv.put('media:carousel', JSON.stringify(list))
    }
    return c.json({ success: true, url })
  } catch (e: any) {
    return c.json({ error: e.message || 'Upload failed' }, 500)
  }
})

/* ═══════════════════════════════════════════════════
   API: Update any content block
   ═══════════════════════════════════════════════════ */
admin.post('/content', async (c) => {
  const kv = c.get('kv')
  const { key, data } = await c.req.json<{ key: string; data: any }>()
  if (!key) return c.json({ error: 'Missing key' }, 400)
  await kv.put(key, JSON.stringify(data))
  return c.json({ success: true })
})

/* ═══════════════════════════════════════════════════
   API: Post notice
   ═══════════════════════════════════════════════════ */
admin.post('/notice', async (c) => {
  const kv = c.get('kv')
  const { textEn, textBn } = await c.req.json<{ textEn?: string; textBn?: string }>()
  const list: any[] = (await kv.get('notices:list', { type: 'json' })) || []
  list.unshift({ id: crypto.randomUUID(), textEn: textEn || '', textBn: textBn || '', timestamp: new Date().toISOString() })
  await kv.put('notices:list', JSON.stringify(list))
  return c.json({ success: true })
})

/* ═══════════════════════════════════════════════════
   API: Set alert
   ═══════════════════════════════════════════════════ */
admin.post('/alert', async (c) => {
  const kv = c.get('kv')
  const { textEn, textBn, type, active } = await c.req.json<{ textEn?: string; textBn?: string; type?: string; active?: boolean }>()
  await kv.put('alerts:active', JSON.stringify({ textEn, textBn, type: type || 'info', active: active !== false }))
  return c.json({ success: true })
})

/* ═══════════════════════════════════════════════════
   API: Add download
   ═══════════════════════════════════════════════════ */
admin.post('/download', async (c) => {
  const kv = c.get('kv')
  const { title, url, fileSize, type } = await c.req.json<{ title?: string; url?: string; fileSize?: string; type?: string }>()
  const list: any[] = (await kv.get('downloads:list', { type: 'json' })) || []
  list.push({ id: crypto.randomUUID(), title: title || '', url: url || '', fileSize: fileSize || '', type: type || 'PDF' })
  await kv.put('downloads:list', JSON.stringify(list))
  return c.json({ success: true })
})

/* ═══════════════════════════════════════════════════
   API: Unified delete
   ═══════════════════════════════════════════════════ */
admin.post('/delete', async (c) => {
  const kv = c.get('kv')
  const { collection, id } = await c.req.json<{ collection: string; id?: string }>()
  if (!collection) return c.json({ error: 'Missing collection' }, 400)

  const kvMap: Record<string, string> = {
    notices: 'notices:list',
    downloads: 'downloads:list',
    carousel: 'media:carousel'
  }

  if (kvMap[collection] && id) {
    const items: any[] = (await kv.get(kvMap[collection], { type: 'json' })) || []
    await kv.put(kvMap[collection], JSON.stringify(items.filter((i: any) => i.id !== id)))
  } else if (collection === 'alert') {
    await kv.delete('alerts:active')
  } else if (collection === 'hero') {
    await kv.delete('media:hero')
  } else if (collection === 'logo') {
    await kv.delete('media:logo')
  }

  return c.json({ success: true })
})

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD HTML — no password logic, just the workspace
   ═══════════════════════════════════════════════════════════════ */

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Admin — Brothers' Tutorial</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={theme:{extend:{colors:{primary:'#1e3a5f',accent:'#f59e0b'}}}}</script>
<style>
*{scrollbar-width:thin;scrollbar-color:#1e3a5f #e2e8f0}
.sl{transition:background .15s,padding-left .15s}
.sl:hover,.sl.on{background:rgba(255,255,255,.12);padding-left:1.25rem}
.sp{display:none}.sp.v{display:block}
.fi{animation:fi .25s ease}
@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.dz{border:2px dashed #94a3b8;transition:border-color .2s,background .2s}
.dz.dg{border-color:#f59e0b;background:#fffbeb}
.tt{animation:si .3s ease,fo .3s ease 2.7s}
@keyframes si{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes fo{to{opacity:0;transform:translateX(100%)}}
</style>
</head>
<body class="bg-slate-100 text-slate-800 font-sans min-h-screen">

<div id="T" class="fixed top-4 right-4 z-[110] space-y-2"></div>

<header class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary text-white h-14 flex items-center px-4 shadow-lg">
  <button id="MB" class="p-1 -ml-1 mr-3">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
  </button>
  <span class="font-bold text-lg">Admin Panel</span>
</header>

<div id="SO" class="lg:hidden fixed inset-0 z-50 bg-black/40 hidden"></div>

<aside id="SB" class="fixed top-0 left-0 z-50 h-full w-64 bg-primary text-white transform -translate-x-full lg:translate-x-0 transition-transform duration-200 flex flex-col">
  <div class="h-14 flex items-center px-5 border-b border-white/10 flex-shrink-0">
    <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mr-3">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#1e3a5f" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"/></svg>
    </div>
    <div>
      <div class="font-bold text-sm leading-tight">Brothers' Tutorial</div>
      <div class="text-[10px] text-white/50">Administration</div>
    </div>
  </div>
  <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 text-sm" id="NV">

    <button data-s="overview" class="sl on w-full text-left px-3 py-2 rounded-lg flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>
      Overview
    </button>

    <div>
      <button data-t="MS" class="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-white/10 transition">
        <span class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>
          Media
        </span>
        <svg id="MC" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 transition-transform"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
      </button>
      <div id="MS" class="hidden pl-4 space-y-0.5 mt-0.5">
        <button data-s="upload" class="sl w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-white/70">Upload Center</button>
        <button data-s="carouselMgr" class="sl w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-white/70">Carousel Items</button>
        <button data-s="heroLogo" class="sl w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-white/70">Hero & Logo</button>
      </div>
    </div>

    <div>
      <button data-t="CS" class="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-white/10 transition">
        <span class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
          Content Editor
        </span>
        <svg id="CC" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 transition-transform"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
      </button>
      <div id="CS" class="hidden pl-4 space-y-0.5 mt-0.5">
        <button data-s="editLanding" class="sl w-full text-left px-3 py-1.5 rounded-lg text-white/70">Landing Page</button>
        <button data-s="editAbout" class="sl w-full text-left px-3 py-1.5 rounded-lg text-white/70">About Page</button>
        <button data-s="editAdmission" class="sl w-full text-left px-3 py-1.5 rounded-lg text-white/70">Admission Page</button>
      </div>
    </div>

    <button data-s="notices" class="sl w-full text-left px-3 py-2 rounded-lg flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg>
      Notice Board
    </button>
    <button data-s="downloads" class="sl w-full text-left px-3 py-2 rounded-lg flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
      Downloads
    </button>
    <button data-s="alerts" class="sl w-full text-left px-3 py-2 rounded-lg flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
      Alert Banner
    </button>
  </nav>
  <div class="p-3 border-t border-white/10 text-[10px] text-white/30 text-center">Brothers Tutorial v1.0</div>
</aside>

<main class="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
<div class="p-4 md:p-6 max-w-5xl mx-auto">

  <div id="sec-overview" class="sp v fi">
    <h1 class="text-2xl font-bold text-primary mb-6">Dashboard Overview</h1>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" id="SC"></div>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h3 class="font-semibold text-primary mb-3">Recent Notices</h3>
        <div id="ON" class="space-y-2 text-sm max-h-48 overflow-y-auto"></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h3 class="font-semibold text-primary mb-3">Active Alert</h3>
        <div id="OA" class="text-sm"></div>
      </div>
    </div>
  </div>

  <div id="sec-upload" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-6">Upload Center</h1>
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div id="DZ" class="dz rounded-xl p-10 text-center cursor-pointer mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-12 h-12 mx-auto text-slate-400 mb-3"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>
        <p class="text-slate-500 font-medium">Drag and drop an image here, or click to select</p>
        <input type="file" id="FI" accept="image/*" class="hidden">
      </div>
      <div id="PW" class="hidden mb-4"><img id="PI" class="max-h-48 mx-auto rounded-lg shadow"></div>
      <div class="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Target</label>
          <select id="UT" class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
            <option value="carousel">Carousel Slider</option>
            <option value="hero">Hero Background</option>
            <option value="logo">Logo</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Caption</label>
          <input id="UC" type="text" placeholder="Optional caption" class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
        </div>
      </div>
      <button id="UB" disabled class="w-full sm:w-auto bg-accent hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">Upload to Cloudinary</button>
    </div>
  </div>

  <div id="sec-carouselMgr" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-6">Carousel Items</h1>
    <div id="CL" class="space-y-3"></div>
  </div>

  <div id="sec-heroLogo" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-6">Hero and Logo</h1>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h3 class="font-semibold text-primary mb-3">Hero Background</h3>
        <div id="HP" class="rounded-lg overflow-hidden bg-slate-100 h-40 flex items-center justify-center text-slate-400 text-sm mb-3">No image</div>
        <button onclick="del('hero')" class="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h3 class="font-semibold text-primary mb-3">Logo</h3>
        <div id="LP" class="rounded-lg overflow-hidden bg-slate-100 h-40 flex items-center justify-center text-slate-400 text-sm mb-3">No image</div>
        <button onclick="del('logo')" class="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
      </div>
    </div>
  </div>

  <div id="sec-editLanding" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-2">Edit Landing Page</h1>
    <p class="text-sm text-slate-500 mb-4">Key: <code class="bg-slate-200 px-1.5 py-0.5 rounded text-xs">content:landing</code></p>
    <div class="bg-white rounded-xl shadow-sm p-5">
      <button onclick="ld('content:landing','LE')" class="mb-3 text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium">Load Data</button>
      <textarea id="LE" rows="14" class="w-full border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-accent focus:outline-none"></textarea>
      <div class="flex gap-2 mt-3">
        <button onclick="fj('LE')" class="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">Format</button>
        <button onclick="sv('content:landing','LE')" class="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg transition font-medium">Save</button>
      </div>
    </div>
  </div>

  <div id="sec-editAbout" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-2">Edit About Page</h1>
    <p class="text-sm text-slate-500 mb-4">Key: <code class="bg-slate-200 px-1.5 py-0.5 rounded text-xs">content:about</code></p>
    <div class="bg-white rounded-xl shadow-sm p-5">
      <button onclick="ld('content:about','AE')" class="mb-3 text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium">Load Data</button>
      <textarea id="AE" rows="14" class="w-full border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-accent focus:outline-none"></textarea>
      <div class="flex gap-2 mt-3">
        <button onclick="fj('AE')" class="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">Format</button>
        <button onclick="sv('content:about','AE')" class="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg transition font-medium">Save</button>
      </div>
    </div>
  </div>

  <div id="sec-editAdmission" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-2">Edit Admission Page</h1>
    <p class="text-sm text-slate-500 mb-4">Key: <code class="bg-slate-200 px-1.5 py-0.5 rounded text-xs">content:admission</code></p>
    <div class="bg-white rounded-xl shadow-sm p-5">
      <button onclick="ld('content:admission','DE')" class="mb-3 text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium">Load Data</button>
      <textarea id="DE" rows="14" class="w-full border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-accent focus:outline-none"></textarea>
      <div class="flex gap-2 mt-3">
        <button onclick="fj('DE')" class="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">Format</button>
        <button onclick="sv('content:admission','DE')" class="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg transition font-medium">Save</button>
      </div>
    </div>
  </div>

  <div id="sec-notices" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-6">Notice Board</h1>
    <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h3 class="font-semibold text-primary mb-3">Post New Notice</h3>
      <div class="space-y-3">
        <input id="NE" type="text" placeholder="English" class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
        <input id="NB" type="text" placeholder="Bengali" class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
        <button onclick="pn()" class="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition">Post Notice</button>
      </div>
    </div>
    <h3 class="font-semibold text-primary mb-3">All Notices</h3>
    <div id="NL" class="space-y-2"></div>
  </div>

  <div id="sec-downloads" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-6">Downloads</h1>
    <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h3 class="font-semibold text-primary mb-3">Add Download</h3>
      <div class="grid sm:grid-cols-2 gap-3">
        <input id="DT" type="text" placeholder="Title" class="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
        <input id="DU" type="url" placeholder="URL" class="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
        <input id="DS" type="text" placeholder="Size e.g. 2.4 MB" class="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
        <select id="DY" class="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
          <option>PDF</option><option>DOC</option><option>XLS</option><option>IMG</option><option>ZIP</option>
        </select>
      </div>
      <button onclick="ad()" class="mt-3 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition">Add Download</button>
    </div>
    <h3 class="font-semibold text-primary mb-3">All Downloads</h3>
    <div id="DL" class="space-y-2"></div>
  </div>

  <div id="sec-alerts" class="sp fi">
    <h1 class="text-2xl font-bold text-primary mb-6">Alert Banner</h1>
    <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h3 class="font-semibold text-primary mb-3">Set Alert</h3>
      <div class="space-y-3">
        <input id="AEN" type="text" placeholder="English" class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
        <input id="ABN" type="text" placeholder="Bengali" class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
        <select id="ATP" class="w-full sm:w-auto border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none">
          <option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="error">Error</option>
        </select>
        <button onclick="sa()" class="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition">Set Alert</button>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-5">
      <h3 class="font-semibold text-primary mb-3">Current Alert</h3>
      <div id="ADISP" class="text-sm text-slate-500">None</div>
    </div>
  </div>

</div>
</main>

<script>
console.log('DASHBOARD JS LOADED');

var D = {};
var TK = new URL(location.href).searchParams.get('token') || '';

function ap(path) {
  return '/admin' + path + (TK ? '?token=' + TK : '');
}

function toast(msg, ok) {
  if (ok === undefined) ok = true;
  var el = document.createElement('div');
  el.className = 'tt px-4 py-2.5 rounded-lg shadow-lg text-white text-sm font-medium ' + (ok ? 'bg-emerald-600' : 'bg-red-600');
  el.textContent = msg;
  document.getElementById('T').appendChild(el);
  setTimeout(function() {
    if (el.parentNode) el.remove();
  }, 3000);
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ac(t) {
  var map = { info: 'blue', warning: 'yellow', success: 'green', error: 'red' };
  return map[t] || 'blue';
}

/* ── Sidebar section navigation ── */
document.querySelectorAll('[data-s]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var sec = btn.getAttribute('data-s');
    document.querySelectorAll('.sp').forEach(function(p) { p.classList.remove('v'); });
    document.querySelectorAll('.sl').forEach(function(l) { l.classList.remove('on'); });
    var panel = document.getElementById('sec-' + sec);
    if (panel) {
      panel.classList.add('v');
      panel.classList.remove('fi');
      void panel.offsetWidth;
      panel.classList.add('fi');
    }
    btn.classList.add('on');
    closeSB();
  });
});

/* ── Collapsible sub-menus ── */
document.querySelectorAll('[data-t]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var subId = btn.getAttribute('data-t');
    var chevId = subId.replace('S', 'C');
    var sub = document.getElementById(subId);
    var chev = document.getElementById(chevId);
    sub.classList.toggle('hidden');
    if (chev) {
      chev.style.transform = sub.classList.contains('hidden') ? '' : 'rotate(90deg)';
    }
  });
});

/* ── Mobile sidebar ── */
function closeSB() {
  document.getElementById('SB').classList.add('-translate-x-full');
  document.getElementById('SO').classList.add('hidden');
}

document.getElementById('MB').addEventListener('click', function() {
  document.getElementById('SB').classList.remove('-translate-x-full');
  document.getElementById('SO').classList.remove('hidden');
});

document.getElementById('SO').addEventListener('click', closeSB);

/* ── Fetch and render data ── */
function init() {
  fetch(ap('/data'))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      D = data;
      render();
    })
    .catch(function() {
      toast('Failed to load data', false);
    });
}

function render() {
  /* Stat cards */
  var sc = document.getElementById('SC');
  var stats = [
    { l: 'Carousel', v: (D.carousel || []).length, c: 'bg-blue-50 text-blue-700' },
    { l: 'Notices', v: (D.notices || []).length, c: 'bg-amber-50 text-amber-700' },
    { l: 'Downloads', v: (D.downloads || []).length, c: 'bg-emerald-50 text-emerald-700' },
    { l: 'Alert', v: D.alert ? 'Active' : 'None', c: D.alert ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500' }
  ];
  sc.innerHTML = stats.map(function(x) {
    return '<div class="rounded-xl shadow-sm p-4 ' + x.c + '"><div class="text-2xl font-bold">' + x.v + '</div><div class="text-sm opacity-70">' + x.l + '</div></div>';
  }).join('');

  /* Overview notices */
  var onEl = document.getElementById('ON');
  var notices = D.notices || [];
  if (notices.length === 0) {
    onEl.innerHTML = '<p class="text-slate-400">No notices yet</p>';
  } else {
    onEl.innerHTML = notices.slice(0, 5).map(function(n) {
      return '<div class="bg-slate-50 rounded-lg p-2"><p class="font-medium text-slate-700">' + esc(n.textEn) + '</p><p class="text-slate-500 text-xs">' + esc(n.textBn) + '</p></div>';
    }).join('');
  }

  /* Overview alert */
  var oaEl = document.getElementById('OA');
  if (D.alert) {
    var clr = ac(D.alert.type);
    oaEl.innerHTML = '<div class="bg-' + clr + '-50 border border-' + clr + '-200 rounded-lg p-3"><p>' + esc(D.alert.textEn) + '</p><p class="text-xs mt-1 opacity-70">' + esc(D.alert.textBn) + '</p></div>';
  } else {
    oaEl.innerHTML = '<p class="text-slate-400">No active alert</p>';
  }

  /* Carousel list */
  var clEl = document.getElementById('CL');
  var slides = D.carousel || [];
  if (slides.length === 0) {
    clEl.innerHTML = '<p class="text-slate-400">No carousel items</p>';
  } else {
    clEl.innerHTML = slides.map(function(x, i) {
      return '<div class="bg-white rounded-xl shadow-sm p-3 flex gap-4 items-center"><img src="' + esc(x.url) + '" class="w-24 h-16 object-cover rounded-lg flex-shrink-0"><div class="flex-1 min-w-0"><p class="font-medium text-sm truncate">' + esc(x.caption || 'Slide ' + (i + 1)) + '</p></div><button onclick="del('carousel','' + x.id + '')" class="text-red-500 text-sm font-medium flex-shrink-0">DEL</button></div>';
    }).join('');
  }

  /* Hero and Logo */
  document.getElementById('HP').innerHTML = D.hero ? '<img src="' + esc(D.hero.url) + '" class="w-full h-full object-cover">' : '<span>No image</span>';
  document.getElementById('LP').innerHTML = D.logo ? '<img src="' + esc(D.logo.url) + '" class="max-h-full max-w-full object-contain p-2">' : '<span>No image</span>';

  /* Notice list */
  var nlEl = document.getElementById('NL');
  if (notices.length === 0) {
    nlEl.innerHTML = '<p class="text-slate-400">No notices</p>';
  } else {
    nlEl.innerHTML = notices.map(function(n) {
      return '<div class="bg-white rounded-xl shadow-sm p-3 flex gap-3 items-start"><div class="flex-1 min-w-0"><p class="font-medium text-sm">' + esc(n.textEn) + '</p><p class="text-sm text-slate-500">' + esc(n.textBn) + '</p><p class="text-xs text-slate-400 mt-1">' + new Date(n.timestamp).toLocaleString() + '</p></div><button onclick="del('notices','' + n.id + '')" class="text-red-500 text-sm font-medium flex-shrink-0">DEL</button></div>';
    }).join('');
  }

  /* Download list */
  var dlEl = document.getElementById('DL');
  var dls = D.downloads || [];
  if (dls.length === 0) {
    dlEl.innerHTML = '<p class="text-slate-400">No downloads</p>';
  } else {
    dlEl.innerHTML = dls.map(function(d) {
      return '<div class="bg-white rounded-xl shadow-sm p-3 flex gap-3 items-center"><div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">' + esc(d.type || 'PDF') + '</div><div class="flex-1 min-w-0"><p class="font-medium text-sm truncate">' + esc(d.title) + '</p><p class="text-xs text-slate-400">' + esc(d.fileSize) + '</p></div><button onclick="del('downloads','' + d.id + '')" class="text-red-500 text-sm font-medium flex-shrink-0">DEL</button></div>';
    }).join('');
  }

  /* Alert display */
  var adEl = document.getElementById('ADISP');
  if (D.alert) {
    var clr2 = ac(D.alert.type);
    adEl.innerHTML = '<div class="border rounded-lg p-3 border-' + clr2 + '-300 bg-' + clr2 + '-50 mb-3"><p class="font-medium">' + esc(D.alert.textEn) + '</p><p class="text-sm opacity-70">' + esc(D.alert.textBn) + '</p></div><button onclick="del('alert')" class="text-red-500 text-sm font-medium">Dismiss</button>';
  } else {
    adEl.innerHTML = '<p class="text-slate-400">None</p>';
  }
}

/* ── Upload logic ── */
var selectedFile = null;
var dropZone = document.getElementById('DZ');
var fileInput = document.getElementById('FI');

dropZone.addEventListener('click', function() {
  fileInput.click();
});

dropZone.addEventListener('dragover', function(e) {
  e.preventDefault();
  dropZone.classList.add('dg');
});

dropZone.addEventListener('dragleave', function() {
  dropZone.classList.remove('dg');
});

dropZone.addEventListener('drop', function(e) {
  e.preventDefault();
  dropZone.classList.remove('dg');
  if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', function() {
  if (fileInput.files[0]) pickFile(fileInput.files[0]);
});

function pickFile(f) {
  if (!f.type.startsWith('image/')) {
    toast('Please select an image', false);
    return;
  }
  selectedFile = f;
  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('PI').src = e.target.result;
    document.getElementById('PW').classList.remove('hidden');
  };
  reader.readAsDataURL(f);
  document.getElementById('UB').disabled = false;
}

document.getElementById('UB').addEventListener('click', function() {
  if (!selectedFile) return;
  var btn = document.getElementById('UB');
  btn.disabled = true;
  btn.textContent = 'Uploading...';

  var fd = new FormData();
  fd.append('file', selectedFile);
  fd.append('target', document.getElementById('UT').value);
  fd.append('caption', document.getElementById('UC').value);

  fetch(ap('/upload'), { method: 'POST', body: fd })
    .then(function(r) { return r.json(); })
    .then(function(j) {
      if (j.success) {
        toast('Uploaded successfully!');
        selectedFile = null;
        fileInput.value = '';
        document.getElementById('PW').classList.add('hidden');
        document.getElementById('UC').value = '';
        btn.textContent = 'Upload to Cloudinary';
        btn.disabled = true;
        init();
      } else {
        toast(j.error || 'Upload failed', false);
        btn.textContent = 'Upload to Cloudinary';
        btn.disabled = false;
      }
    })
    .catch(function() {
      toast('Network error', false);
      btn.textContent = 'Upload to Cloudinary';
      btn.disabled = false;
    });
});

/* ── CRUD functions ── */
function pn() {
  var en = document.getElementById('NE').value.trim();
  var bn = document.getElementById('NB').value.trim();
  if (!en && !bn) { toast('Enter notice text', false); return; }
  fetch(ap('/notice'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ textEn: en, textBn: bn })
  })
  .then(function(r) { return r.json(); })
  .then(function(j) {
    if (j.success) {
      toast('Notice posted!');
      document.getElementById('NE').value = '';
      document.getElementById('NB').value = '';
      init();
    } else { toast('Failed', false); }
  });
}

function ad() {
  var t = document.getElementById('DT').value.trim();
  var u = document.getElementById('DU').value.trim();
  var s = document.getElementById('DS').value.trim();
  var y = document.getElementById('DY').value;
  if (!t || !u) { toast('Title and URL required', false); return; }
  fetch(ap('/download'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: t, url: u, fileSize: s, type: y })
  })
  .then(function(r) { return r.json(); })
  .then(function(j) {
    if (j.success) {
      toast('Download added!');
      document.getElementById('DT').value = '';
      document.getElementById('DU').value = '';
      document.getElementById('DS').value = '';
      init();
    } else { toast('Failed', false); }
  });
}

function sa() {
  var en = document.getElementById('AEN').value.trim();
  var bn = document.getElementById('ABN').value.trim();
  var tp = document.getElementById('ATP').value;
  if (!en && !bn) { toast('Enter alert text', false); return; }
  fetch(ap('/alert'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ textEn: en, textBn: bn, type: tp, active: true })
  })
  .then(function(r) { return r.json(); })
  .then(function(j) {
    if (j.success) {
      toast('Alert set!');
      document.getElementById('AEN').value = '';
      document.getElementById('ABN').value = '';
      init();
    } else { toast('Failed', false); }
  });
}

function del(collection, id) {
  fetch(ap('/delete'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: collection, id: id })
  })
  .then(function(r) { return r.json(); })
  .then(function(j) {
    if (j.success) {
      toast('Deleted!');
      init();
    } else { toast('Failed', false); }
  });
}

function ld(key, editorId) {
  fetch(ap('/data'))
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var map = {
        'content:landing': 'landing',
        'content:about': 'about',
        'content:admission': 'admission'
      };
      var val = d[map[key]];
      if (val) {
        document.getElementById(editorId).value = JSON.stringify(val, null, 2);
      } else {
        toast('No data found', false);
      }
    });
}

function sv(key, editorId) {
  try {
    var data = JSON.parse(document.getElementById(editorId).value);
    fetch(ap('/content'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key, data: data })
    })
    .then(function(r) { return r.json(); })
    .then(function(j) {
      if (j.success) toast('Saved!');
      else toast('Failed', false);
    });
  } catch (e) {
    toast('Invalid JSON', false);
  }
}

function fj(id) {
  try {
    var obj = JSON.parse(document.getElementById(id).value);
    document.getElementById(id).value = JSON.stringify(obj, null, 2);
    toast('Formatted!');
  } catch (e) {
    toast('Invalid JSON', false);
  }
}

/* ── Boot ── */
init();
</script>
</body>
</html>`

export { admin as adminRoutes }