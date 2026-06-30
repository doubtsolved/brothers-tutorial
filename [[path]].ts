import { handle } from 'hono/cloudflare-pages'
import app from '../src/index.ts'

export const onRequest = handle(app)
