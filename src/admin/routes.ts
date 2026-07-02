import { Hono } from 'hono'
import { createHash } from 'crypto'
import { v2 as cloudinary } from 'cloudinary'

// Export the sub-router to be mounted in the main app entry point
export const adminRoutes = new Hono()
const SECURE_TOKEN = 'brothers_academic_secret_2026'
const TARGET_PASSWORD_HASH = createHash('sha256').update('admin123').digest('hex')

// Initialize Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dx9uijq1v',
  api_key: '468867312281135',
  api_secret: 'IsIVfgRUKZEXlmoHuOzG8oA1dio'
})

// NEW / RESTORED: Layout shell function wrapper for admin interfaces
const DashboardShell = (title: string, content: string, token: string = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .collapsible-content { max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0, 1, 0, 1); }
    .collapsible-content.expanded { max-height: 2000px; transition: max-height 0.3s ease-in-out; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen antialiased flex flex-col">
  <nav class="bg-[#1e3a5f] text-white py-4 px-6 shadow-md flex justify-between items-center sticky top-0 z-50">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-amber-400"><i data-lucide="shield-check" class="w-5 h-5"></i></div>
      <h1 class="text-lg font-bold tracking-tight">Admin Workplace</h1>
    </div>
    <div class="flex gap-3 items-center">
      ${token ? `<a href="/admin/dashboard?token=${token}" class="text-xs font-semibold bg-white/10 px-3 py-2 rounded-xl hover:bg-white/20 transition flex items-center gap-1.5"><i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>Dashboard</a>` : ''}
      <a href="/" class="text-xs font-medium border border-white/20 px-3 py-2 rounded-xl hover:bg-white/10 transition flex items-center gap-1.5"><i data-lucide="eye" class="w-3.5 h-3.5"></i>View Site</a>
    </div>
  </nav>
  <main class="flex-grow max-w-4xl w-full mx-auto px-4 py-8 space-y-4">${content}</main>

  
  <script>lucide.createIcons();</script>

<script>
  function initializeAdminIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    } else {
      console.error("Lucide CDN payload failed to parse or load.");
    }
  }
  // Safe listener execution block across mobile and desktop browser lifecycles
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminIcons);
  } else {
    initializeAdminIcons();
  }
</script>
</body>
</html>
`

// Clean configuration context wrappers pass upstream bindings safely


// Helper shortcuts to pass data contexts upstream from our global app environment bindings
// FIXED: Ensured the Hono context 'c' is explicitly passed and evaluated in the function signatures
const getDataset = async (c: any) => await c.env.getDatasetHelper(c)
const saveDataset = async (c: any, data: any) => await c.env.saveDatasetHelper(c, data)
const serveHtml = (filename: string) => (c: any) => c.env.serveHtmlHelper(c, filename)
// ----------------- ADMINISTRATIVE CONTROLS ROUTING -----------------

// Admin Gateway Login Portal Redirector
// ----------------- ADMINISTRATIVE CONTROLS ROUTING -----------------

// Admin Gateway Login Portal Redirector
// ----------------- ADMINISTRATIVE CONTROLS ROUTING -----------------

// Admin Gateway Login Portal
adminRoutes.get('/', (c) => {
  if (c.req.query('token') === SECURE_TOKEN) return c.redirect(`/admin/dashboard?token=${SECURE_TOKEN}`)
  
  const error = c.req.query('error')
  const loginHTML = `
    <div class="max-w-md mx-auto mt-12 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-[#1e3a5f]">
        <i data-lucide="lock" class="w-5 h-5"></i>
      </div>
      <h2 class="text-xl font-bold text-slate-800 text-center mb-5">Workspace Verification</h2>
      ${error ? `<div class="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4"></i>${error}</div>` : ''}
      <form action="/admin/login" method="POST" class="space-y-3">
        <input type="password" name="password" placeholder="Enter Access Passkey" required class="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]">
        <button type="submit" class="w-full py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#2c5282] active:scale-[0.99] transition-all">Verify</button>
      </form>
    </div>
  `
  return c.html(DashboardShell('Admin Login', loginHTML))
})
// Secure Authentication via Passkey Verification
adminRoutes.post('/login', async (c) => {
  const { password } = await c.req.parseBody()
  const incomingHash = createHash('sha256').update(password as string).digest('hex')
  if (incomingHash === TARGET_PASSWORD_HASH) return c.redirect(`/admin/dashboard?token=${SECURE_TOKEN}`)
  return c.redirect('/admin?error=Invalid+Passkey')
})

// Protected Admin Dashboard Console View
adminRoutes.get('/dashboard', async (c) => {
  if (c.req.query('token') !== SECURE_TOKEN) return c.redirect('/admin')
  const data = await getDataset(c)

  const noticesListHTML = (data.notices || []).map((n: any) => `
    <div class="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 text-sm">
      <div class="pr-4"><span class="font-semibold block text-slate-800">${n.title}</span><span class="text-slate-400 text-xs">${n.desc}</span></div>
      <a href="/admin/delete/notice/${n.id}?token=${SECURE_TOKEN}" class="text-red-500 font-medium hover:text-red-700 text-xs flex items-center gap-1 shrink-0"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete</a>
    </div>
  `).join('')

  const downloadsListHTML = (data.downloads || []).map((d: any) => `
    <div class="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 text-sm">
      <div class="pr-4 min-w-0"><span class="font-semibold block text-slate-800 truncate">${d.title}</span><span class="text-xs text-blue-500 truncate block">${d.url}</span></div>
      <a href="/admin/delete/download/${d.id}?token=${SECURE_TOKEN}" class="text-red-500 font-medium hover:text-red-700 text-xs flex items-center gap-1 shrink-0"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete</a>
    </div>
  `).join('')

  const carouselListHTML = (data.carousel || []).map((slide: any) => `
    <div class="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 text-sm">
      <div class="flex gap-3 items-center min-w-0">
        <img src="${slide.src}" class="w-9 h-9 object-cover rounded-lg border border-slate-100 flex-shrink-0">
        <span class="text-slate-500 italic text-xs truncate">${slide.caption || 'No Caption'}</span>
      </div>
      <a href="/admin/delete/carousel/${slide.id}?token=${SECURE_TOKEN}" class="text-red-500 font-medium hover:text-red-700 text-xs flex items-center gap-1 shrink-0"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete</a>
    </div>
  `).join('')

  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Workplace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .collapsible-content { max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0, 1, 0, 1); }
    .collapsible-content.expanded { max-height: 2000px; transition: max-height 0.3s ease-in-out; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen antialiased flex flex-col">
  <nav class="bg-[#1e3a5f] text-white py-4 px-6 shadow-md flex justify-between items-center sticky top-0 z-50">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-amber-400"><i data-lucide="shield-check" class="w-5 h-5"></i></div>
      <h1 class="text-lg font-bold tracking-tight">Admin Workplace</h1>
    </div>
    <div class="flex gap-3 items-center">
      <a href="/" class="text-xs font-medium border border-white/20 px-3 py-2 rounded-xl hover:bg-white/10 transition flex items-center gap-1.5"><i data-lucide="eye" class="w-3.5 h-3.5"></i>View Site</a>
    </div>
  </nav>

  <main class="flex-grow max-w-4xl w-full mx-auto px-4 py-8 space-y-4">
    <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <button type="button" class="w-full px-5 py-4 flex items-center justify-between bg-white text-left font-bold text-slate-800 hover:bg-slate-50/50 transition-colors" onclick="toggleSection('sec-media', this)">
        <span class="flex items-center gap-2.5 text-base text-[#1e3a5f]"><i data-lucide="cloud-lightning" class="w-4 h-4 text-emerald-600"></i> Cloudinary Media Upload Center</span>
        <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform transform"></i>
      </button>
      <div id="sec-media" class="collapsible-content border-t border-slate-100 bg-white">
        <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="md:col-span-2 space-y-3.5">
            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Section Location</label>
              <select id="cloudinaryTargetType" class="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none">
                <option value="carousel">Add New Slide to "About Us" Carousel Slider</option>
                <option value="hero">Overwrite Landing Hero Section Main Background Image</option>
                <option value="logo">Overwrite Institution Official Logo Image</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Slide Caption Description</label>
              <input type="text" id="cloudinaryCaption" placeholder="e.g. Cultural Program / সাংস্কৃতিক অনুষ্ঠান" class="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none">
            </div>
            <div class="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-emerald-500 transition-colors relative cursor-pointer" id="dropzoneContainer">
              <input type="file" id="cloudinaryFileInput" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
              <div class="space-y-1.5 pointer-events-none">
                <div class="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mx-auto"><i data-lucide="image" class="w-4 h-4"></i></div>
                <p class="text-xs font-medium text-slate-600">Click or Drag photo here to begin uploading</p>
              </div>
            </div>
          </div>
          <div class="bg-slate-50/50 rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Upload Preview</span>
            <div class="flex-grow flex items-center justify-center border bg-white rounded-lg overflow-hidden aspect-video relative max-h-[120px]">
              <img id="uploadPreviewImage" class="w-full h-full object-cover hidden">
              <div id="uploadPreviewPlaceholder" class="text-slate-400 text-xs text-center"><i data-lucide="eye-off" class="w-4 h-4 mx-auto mb-1"></i> No file selected</div>
            </div>
            <button type="button" id="startUploadBtn" disabled class="w-full mt-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl opacity-50 cursor-not-allowed hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"><i data-lucide="upload-cloud" class="w-3.5 h-3.5"></i> Transmit to Cloudinary</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <button type="button" class="w-full px-5 py-4 flex items-center justify-between bg-white text-left font-bold text-slate-800 hover:bg-slate-50/50 transition-colors" onclick="toggleSection('sec-text', this)">
        <span class="flex items-center gap-2.5 text-base text-[#1e3a5f]"><i data-lucide="file-edit" class="w-4 h-4 text-blue-600"></i> Edit Site Text Content</span>
        <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform transform"></i>
      </button>
      <div id="sec-text" class="collapsible-content border-t border-slate-100 bg-white">
        <form action="/admin/update/sections" method="POST" class="p-5 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2"><label class="block text-xs font-medium text-slate-500 mb-1">Announcement Banner Text</label><input type="text" name="bannerText" value="${data.sections.bannerText || ''}" class="w-full px-3 py-2 text-sm border rounded-xl border-slate-200 focus:outline-none"></div>
            <div><label class="block text-xs font-medium text-slate-500 mb-1">Hero Tagline</label><input type="text" name="heroTagline" value="${data.sections.heroTagline || ''}" class="w-full px-3 py-2 text-sm border rounded-xl border-slate-200"></div>
            <div><label class="block text-xs font-medium text-slate-500 mb-1">Hero Background Image Link URL</label><input type="url" name="heroImageUrl" value="${data.sections.heroImageUrl || ''}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/50" readonly></div>
            <div class="md:col-span-2"><label class="block text-xs font-medium text-slate-500 mb-1">Hero Heading Title</label><input type="text" name="heroHeading" value="${data.sections.heroHeading || ''}" class="w-full px-3 py-2 text-sm border rounded-xl border-slate-200"></div>
            <div class="md:col-span-2"><label class="block text-xs font-medium text-slate-500 mb-1">Hero Subheading Summary</label><textarea name="heroSubheading" rows="2" class="w-full px-3 py-2 text-sm border rounded-xl border-slate-200">${data.sections.heroSubheading || ''}</textarea></div>
            <div><label class="block text-xs font-medium text-slate-500 mb-1">About Section Title</label><input type="text" name="aboutHeading" value="${data.sections.aboutHeading || ''}" class="w-full px-3 py-2 text-sm border rounded-xl border-slate-200"></div>
            <div><label class="block text-xs font-medium text-slate-500 mb-1">About Section Subtitle</label><input type="text" name="aboutDescription" value="${data.sections.aboutDescription || ''}" class="w-full px-3 py-2 text-sm border rounded-xl border-slate-200"></div>
          </div>
          
          <div class="border-t border-slate-100 pt-4"><h4 class="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-3">Academic Pillars Details</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div class="p-3 bg-slate-50/50 rounded-xl border border-slate-100"><input type="text" name="p1Title" value="${data.sections.p1Title || ''}" class="w-full px-2 py-1 text-xs border border-slate-200 rounded font-bold mb-1"><textarea name="p1Desc" rows="2" class="w-full px-2 py-1 text-xs border border-slate-200 rounded">${data.sections.p1Desc || ''}</textarea></div>
              <div class="p-3 bg-slate-50/50 rounded-xl border border-slate-100"><input type="text" name="p2Title" value="${data.sections.p2Title || ''}" class="w-full px-2 py-1 text-xs border border-slate-200 rounded font-bold mb-1"><textarea name="p2Desc" rows="2" class="w-full px-2 py-1 text-xs border border-slate-200 rounded">${data.sections.p2Desc || ''}</textarea></div>
              <div class="p-3 bg-slate-50/50 rounded-xl border border-slate-100"><input type="text" name="p3Title" value="${data.sections.p3Title || ''}" class="w-full px-2 py-1 text-xs border border-slate-200 rounded font-bold mb-1"><textarea name="p3Desc" rows="2" class="w-full px-2 py-1 text-xs border border-slate-200 rounded">${data.sections.p3Desc || ''}</textarea></div>
              <div class="p-3 bg-slate-50/50 rounded-xl border border-slate-100"><input type="text" name="p4Title" value="${data.sections.p4Title || ''}" class="w-full px-2 py-1 text-xs border border-slate-200 rounded font-bold mb-1"><textarea name="p4Desc" rows="2" class="w-full px-2 py-1 text-xs border border-slate-200 rounded">${data.sections.p4Desc || ''}</textarea></div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4"><h4 class="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-3">Admissions & Contact Footers</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2"><label class="block text-xs font-medium text-slate-500 mb-1">Eligibility Policy Guidelines</label><input type="text" name="policyText" value="${data.sections.policyText || ''}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"></div>
              <div class="md:col-span-2"><label class="block text-xs font-medium text-slate-500 mb-1">Address Location Info</label><input type="text" name="addressText" value="${data.sections.addressText || ''}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"></div>
              <div><label class="block text-xs font-medium text-slate-500 mb-1">Footer Phone</label><input type="text" name="footerPhone" value="${data.sections.footerPhone || ''}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"></div>
              <div><label class="block text-xs font-medium text-slate-500 mb-1">Footer Email</label><input type="text" name="footerEmail" value="${data.sections.footerEmail || ''}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"></div>
            </div>
          </div>
          <button type="submit" class="px-5 py-2.5 bg-[#1e3a5f] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#2c5282] transition">Save Text Changes</button>
        </form>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <button type="button" class="w-full px-4 py-3.5 flex items-center justify-between bg-white text-left font-bold text-slate-800 hover:bg-slate-50/50 transition-colors" onclick="toggleSection('sec-notices', this)">
          <span class="flex items-center gap-2 text-sm text-slate-700"><i data-lucide="bell" class="w-4 h-4 text-amber-500"></i> Notice Board Timeline</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform transform"></i>
        </button>
        <div id="sec-notices" class="collapsible-content border-t border-slate-100 bg-white">
          <div class="p-4 space-y-4">
            <form action="/admin/add/notice" method="POST" class="space-y-2">
              <input type="text" name="title" placeholder="Notice Title" required class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none">
              <input type="text" name="desc" placeholder="Details description" required class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none">
              <button type="submit" class="w-full py-2 bg-[#f59e0b] font-bold text-xs rounded-lg text-slate-900 shadow-sm hover:bg-amber-500 transition">Add New Alert</button>
            </form>
            <div class="divide-y max-h-60 overflow-y-auto">${noticesListHTML}</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <button type="button" class="w-full px-4 py-3.5 flex items-center justify-between bg-white text-left font-bold text-slate-800 hover:bg-slate-50/50 transition-colors" onclick="toggleSection('sec-downloads', this)">
          <span class="flex items-center gap-2 text-sm text-slate-700"><i data-lucide="link" class="w-4 h-4 text-blue-500"></i> Resource Downloads Links</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform transform"></i>
        </button>
        <div id="sec-downloads" class="collapsible-content border-t border-slate-100 bg-white">
          <div class="p-4 space-y-4">
            <form action="/admin/add/download" method="POST" class="space-y-2">
              <input type="text" name="title" placeholder="Resource Document Label" required class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg">
              <input type="url" name="url" placeholder="Resource Document URL" required class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg">
              <div class="grid grid-cols-2 gap-1.5"><input type="text" name="size" placeholder="Size (e.g. 1.5 MB)" required class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"><select name="type" class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"><option value="PDF">PDF</option><option value="DOCX">DOCX</option><option value="LINK">LINK</option></select></div>
              <button type="submit" class="w-full py-2 bg-[#2c5282] text-white font-bold text-xs rounded-lg shadow-sm hover:bg-blue-800 transition">Save Link Reference</button>
            </form>
            <div class="divide-y max-h-60 overflow-y-auto">${downloadsListHTML}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <button type="button" class="w-full px-5 py-3.5 flex items-center justify-between bg-white text-left font-bold text-slate-800 hover:bg-slate-50/50 transition-colors" onclick="toggleSection('sec-carousel', this)">
        <span class="flex items-center gap-2 text-sm text-slate-700"><i data-lucide="images" class="w-4 h-4 text-emerald-500"></i> Active Slides Media Gallery</span>
        <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform transform"></i>
      </button>
      <div id="sec-carousel" class="collapsible-content border-t border-slate-100 bg-white">
        <div class="p-4 max-h-80 overflow-y-auto divide-y divide-slate-50">${carouselListHTML}</div>
      </div>
    </div>
  </main>

  <script>
    function toggleSection(id, element) {
      const target = document.getElementById(id);
      const icon = element.querySelector('[data-lucide="chevron-down"]');
      target.classList.toggle('expanded');
      icon.style.transform = target.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    document.getElementById('sec-media').classList.add('expanded');
    document.querySelector('[onclick="toggleSection(\\'sec-media\\', this)"] [data-lucide="chevron-down"]').style.transform = 'rotate(180deg)';

    const fileInput = document.getElementById('cloudinaryFileInput');
    const startUploadBtn = document.getElementById('startUploadBtn');
    const previewImage = document.getElementById('uploadPreviewImage');
    const previewPlaceholder = document.getElementById('uploadPreviewPlaceholder');
    let capturedBase64String = null;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        capturedBase64String = reader.result;
        previewImage.src = capturedBase64String;
        previewImage.classList.remove('hidden');
        previewPlaceholder.classList.add('hidden');
        startUploadBtn.disabled = false;
        startUploadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      };
      reader.readAsDataURL(file);
    });

    startUploadBtn.addEventListener('click', async () => {
      if(!capturedBase64String) return;
      startUploadBtn.disabled = true;
      startUploadBtn.innerHTML = 'Uploading...';
      
      try {
        const res = await fetch('/admin/upload-image?token=${SECURE_TOKEN}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: capturedBase64String,
            targetType: document.getElementById('cloudinaryTargetType').value,
            caption: document.getElementById('cloudinaryCaption').value
          })
        });
        const result = await res.json();
        if(result.success) {
          alert('🎉 Asset updated and database saved perfectly!');
          window.location.reload();
        } else {
          alert('❌ Upload error details: ' + result.error);
          window.location.reload();
        }
      } catch(err) {
        alert('❌ Network sync failure.');
        window.location.reload();
      }
    });
  </script>
</body>
</html>
  `)
})

// --- DATA REMOVAL GATES WITH SIMPLIFIED PREFIX PARSING ---
adminRoutes.get('/delete/:type/:id', async (c) => {
  if (c.req.query('token') !== SECURE_TOKEN) return c.redirect('/admin')
  const { type, id } = c.req.param()
  const data = await getDataset(c)

  if (type === 'notice') data.notices = data.notices.filter((n: any) => n.id !== id)
  if (type === 'download') data.downloads = data.downloads.filter((d: any) => d.id !== id)
  if (type === 'carousel') data.carousel = data.carousel.filter((cl: any) => cl.id !== id)

  await saveDataset(c, data)
  return c.redirect(`/admin/dashboard?token=${SECURE_TOKEN}`)
})