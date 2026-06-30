import { handle } from 'hono/cloudflare-pages'
import app from '../src/index.ts'

// This ensures all requests, including api endpoints, are routed cleanly through your Hono app execution context
export const onRequest = (context) => {
  return handle(app)(context)
}
