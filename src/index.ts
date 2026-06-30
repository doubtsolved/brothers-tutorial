import { Hono } from 'hono'

const app = new Hono()

// KV helper strictly for Cloudflare Runtime
const getKV = async (c: any) => {
  const data = await c.env.BROTHERS_KV.get('site_data')
  return JSON.parse(data || '{}')
}

// 1. Core API for your frontend
app.get('/api/content', async (c) => {
  const data = await getKV(c)
  return c.json(data)
})

// 2. Serve your pages as dynamic templates (using the same logic as Admin)
app.get('/', async (c) => {
  const data = await getKV(c)
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <h1 id="hero-title">${data.sections.heroHeading}</h1>
        <script>
          // Frontend fetch to ensure it grabs the live data
          fetch('/api/content')
            .then(res => res.json())
            .then(data => {
              document.getElementById('hero-title').innerText = data.sections.heroHeading;
            });
        </script>
      </body>
    </html>
  `)
})

export default app