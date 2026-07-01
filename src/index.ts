import { Hono } from 'hono'
import { adminRoutes } from './admin/routes.ts'

type Bindings = {
  BROTHERS_KV: KVNamespace
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_UPLOAD_PRESET: string
}

type Variables = {
  kv: any
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

/* ── Detect runtime ── */
const isNode = typeof process !== 'undefined' && process.versions?.node

/* ── Prepare KV fallback (mock for local, noop for edge) ── */
const noopKV = {
  get: async () => null,
  put: async () => {},
  delete: async () => {},
  list: async () => ({ keys: [], list_complete: true, cursor: '' })
}

let kvFallback: any = noopKV
if (isNode) {
  try {
    const m = await import('./kvMo' + 'ck.ts')
    kvFallback = new m.KVMock()
  } catch (e) {
    console.warn('KV Mock unavailable, using noop fallback:', e)
  }
}

/* ── Global middleware: safely preserve & merge Cloudflare env properties ── */
app.use('*', async (c, next) => {
  c.set('kv', c.env.BROTHERS_KV || kvFallback)
  await next()
})

/* ── Default content seeds ── */
const defaultLanding = {
  heroTitleEn: "Brothers' Tutorial",
  heroTitleBn: 'ব্রাদার্স টিউটোরিয়াল',
  heroSubtitleEn: 'Nurturing Minds, Building Futures — Excellence in Education Since 2010',
  heroSubtitleBn: 'মনন গড়া, ভবিষ্যৎ নির্মাণ — ২০১০ সাল থেকে শিক্ষায় শ্রেষ্ঠত্ব',
  aboutBriefEn: 'A premier coaching institute in Baruipara, Nadia, dedicated to academic excellence and holistic student development across all boards and competitive exams.',
  aboutBriefBn: 'বড়ুইপাড়া, নদিয়ায় অবস্থিত একটি শীর্ষস্থানীয় কোচিং ইনস্টিটিউট, যা সকল বোর্ড ও প্রতিযোগিতামূলক পরীক্ষায় শিক্ষায় শ্রেষ্ঠত্ব এবং শিক্ষার্থীদের সামগ্রিক বিকাশে নিবেদিত।',
  features: [
    { icon: 'academicCap', titleEn: 'Expert Faculty', titleBn: 'অভিজ্ঞ শিক্ষকমণ্ডলী', descEn: 'Highly qualified and experienced teachers guiding students towards success.', descBn: 'শিক্ষার্থীদের সাফল্যের দিকে পরিচালিত করছেন অত্যন্ত যোগ্য ও অভিজ্ঞ শিক্ষকগণ।' },
    { icon: 'bookOpen', titleEn: 'Comprehensive Curriculum', titleBn: 'ব্যাপক পাঠ্যক্রম', descEn: 'Well-structured study materials covering the complete syllabus for every subject.', descBn: 'প্রতিটি বিষয়ের সম্পূর্ণ পাঠ্যক্রম বিস্তৃত ও সু-কাঠামোগত অধ্যয়ন সামগ্রী।' },
    { icon: 'users', titleEn: 'Small Batch Size', titleBn: 'ছোট ব্যাচ সাইজ', descEn: 'Limited students per batch ensuring personalized attention for everyone.', descBn: 'প্রতিটি ব্যাচে সীমিত শিক্ষার্থী নিশ্চিত করে সবার জন্য ব্যক্তিগত মনোযোগ।' },
    { icon: 'clock', titleEn: 'Regular Tests & Feedback', titleBn: 'নিয়মিত পরীক্ষা ও মতামত', descEn: 'Frequent assessments to track progress and identify areas of improvement.', descBn: 'অগ্রগতি ট্র্যাক করতে এবং উন্নতির ক্ষেত্র চিহ্নিত করতে ঘন ঘন মূল্যায়ন।' }
  ],
  stats: { students: '500+', teachers: '25+', years: '14+', results: '95%+' }
}

const defaultAbout = {
  titleEn: "About Brothers' Tutorial",
  titleBn: 'ব্রাদার্স টিউটোরিয়াল সম্পর্কে',
  descriptionEn: "Brothers' Tutorial was established in 2010 in Baruipara, Nadia, West Bengal, with a vision to provide quality education to students from Class V to XII. Our institute has grown from a small group of passionate educators to a full-fledged academic center serving over 500 students annually.\n\nWe specialize in preparing students for West Bengal Board examinations (Madhyamik and Higher Secondary), along with foundational coaching for national-level competitive exams like JEE and NEET. Our teaching methodology combines traditional rigor with modern pedagogical techniques, ensuring that every student receives a well-rounded educational experience.",
  descriptionBn: 'ব্রাদার্স টিউটোরিয়াল ২০১০ সালে পশ্চিমবঙ্গের নদিয়া জেলার বড়ুইপাড়ায় পঞ্চম শ্রেণি থেকে দ্বাদশ শ্রেণির শিক্ষার্থীদের মানসম্মত শিক্ষা প্রদানের লক্ষ্যে প্রতিষ্ঠিত হয়েছিল। আমাদের প্রতিষ্ঠান অভিজ্ঞ শিক্ষকদের একটি ছোট দল থেকে বৃদ্ধি পেয়ে বছরে ৫০০ এরও বেশি শিক্ষার্থীকে সেবা প্রদানকারী একটি পূর্ণাঙ্গ একাডেমিক কেন্দ্রে পরিণত হয়েছে।\n\nআমরা পশ্চিমবঙ্গ বোর্ড পরীক্ষা (মাধ্যমিক ও উচ্চমাধ্যমিক) এবং জেইই ও নিট-এর মতো জাতীয় স্তরের প্রতিযোগিতামূলক পরীক্ষার জন্য ভিত্তিগত কোচিংয়ে বিশেষজ্ঞ। আমাদের শিক্ষাদান পদ্ধতি ঐতিহ্যবাহী কঠোরতার সাথে আধুনিক শিক্ষাবিজ্ঞান কৌশলের সমন্বয় করে, যাতে প্রতিটি শিক্ষার্থী একটি সুষম শিক্ষামূলক অভিজ্ঞতা লাভ করে।',
  missionEn: 'To empower every student with knowledge, confidence, and moral values, transforming them into responsible citizens and future leaders.',
  missionBn: 'প্রতিটি শিক্ষার্থীকে জ্ঞান, আত্মবিশ্বাস এবং নৈতিক মূল্যবোধ দিয়ে শক্তিশালী করা, তাদের দায়িত্বশীল নাগরিক এবং ভবিষ্যতের নেতা হিসেবে রূপান্তরিত করা।',
  visionEn: 'To become the most trusted and result-oriented educational institute in the Nadia district, setting benchmarks in academic excellence.',
  visionBn: 'নদিয়া জেলার সবচেয়ে বিশ্বস্ত এবং ফলাফল-ভিত্তিক শিক্ষা প্রতিষ্ঠান হওয়া, শিক্ষায় শ্রেষ্ঠত্বের মানদণ্ড স্থাপন করা।'
}

const defaultAdmission = {
  titleEn: 'Admission Details',
  titleBn: 'ভর্তি বিবরণ',
  introEn: 'Admissions are open for the current academic session. Secure your seat early to ensure the best batch timing and faculty assignment.',
  introBn: 'বর্তমান শিক্ষাবর্ষের জন্য ভর্তি চলছে। সেরা ব্যাচ টাইমিং এবং শিক্ষক নিয়োগ নিশ্চিত করতে আগেভাগে আপনার আসন সুরক্ষিত করুন।',
  classes: [
    { nameEn: 'Class V – VIII (All Subjects)', nameBn: 'পঞ্চম – অষ্টম শ্রেণি (সকল বিষয়)', feeEn: '\u20B9800/month', feeBn: '\u20B9\u09AE\u09BE\u09B8/\u09EE\u09EE\u09EE' },
    { nameEn: 'Class IX – X (Science & Arts)', nameBn: 'নবম – দশম শ্রেণি (বিজ্ঞান ও কলা)', feeEn: '\u20B91,200/month', feeBn: '\u20B9\u09EF,\u09EE\u09EE\u09AE\u09BE\u09B8' },
    { nameEn: 'Class XI – XII (Science Stream)', nameBn: 'একাদশ – দ্বাদশ শ্রেণি (বিজ্ঞান বিভাগ)', feeEn: '\u20B91,500/month', feeBn: '\u20B9\u09EF,\u09EB\u09EE\u09EE\u09AE\u09BE\u09B8' },
    { nameEn: 'JEE / NEET Foundation', nameBn: 'জেইই / নিট ফাউন্ডেশন', feeEn: '\u20B92,000/month', feeBn: '\u20B9\u09EE,\u09EE\u09EE\u09AE\u09BE\u09B8' }
  ],
  documentsEn: 'Required Documents: Marksheet of last exam, 2 passport-size photographs, Aadhaar card photocopy, and admission fee.',
  documentsBn: 'প্রয়োজনীয় কাগজপত্র: শেষ পরীক্ষার মার্কশিট, ২টি পাসপোর্ট সাইজের ছবি, আধার কার্ডের ফটোকপি এবং ভর্তি ফি।',
  contactEn: 'Visit our office at Baruipara, Nadia or call us for admission enquiries.',
  contactBn: 'ভর্তি সংক্রান্ত তথ্যের জন্য নদিয়ার বড়ুইপাড়ায় আমাদের অফিসে আসুন বা আমাদের কল করুন।'
}

/* ── Public API ── */
app.get('/api/content', async (c) => {
  const kv = c.get('kv')
  try {
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
    return c.json({
      landing: landing || defaultLanding,
      about: about || defaultAbout,
      admission: admission || defaultAdmission,
      alert: alert || null,
      notices: notices || [],
      downloads: downloads || [],
      carousel: carousel || [],
      hero: hero || null,
      logo: logo || null
    })
  } catch (err) {
    console.error('API Error:', err)
    return c.json({
      landing: defaultLanding, about: defaultAbout, admission: defaultAdmission,
      alert: null, notices: [], downloads: [], carousel: [], hero: null, logo: null
    })
  }
})

/* ── Admin routes (decoupled) ── */
app.route('/admin', adminRoutes)

/* ── Static file serving — local Node.js only ── */
/* if (isNode) {
  const { serve, serveStatic } = await import('@hono/node-server')
  app.use('/*', serveStatic({
    root: './public',
    rewriteRequestPath: (path: string) => (path === '/' ? '/index.html' : path)
  }))
  serve(
    { fetch: app.fetch, port: 3000 },
    (info: { port: number }) => {
      console.log('\n🚀 Brothers\' Tutorial — Local Dev Server')
      console.log(`   ➜  http://localhost:${info.port}`)
      console.log(`   ➜  Admin: http://localhost:${info.port}/admin?token=brothers_academic_secret_2026\n`)
    }
  )
} */

if (isNode) {
  const { readFileSync, existsSync, statSync } = await import('node:fs')
  const { join, extname } = await import('node:path')
  const { serve } = await import('@hono/node-server')

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
}



export default app

