import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const STORE_PATH = join(__dirname, '..', 'kv_local_store.json')

function readStore(): Record<string, string> {
  try {
    if (existsSync(STORE_PATH)) {
      return JSON.parse(readFileSync(STORE_PATH, 'utf-8'))
    }
  } catch {
    /* corrupted → start fresh */
  }
  return {}
}

function writeStore(data: Record<string, string>): void {
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export class KVMock {
  async get(key: string, options?: { type?: string }): Promise<any> {
    const store = readStore()
    const raw = store[key]
    if (raw === undefined) return null
    if (options?.type === 'json') {
      try { return JSON.parse(raw) } catch { return null }
    }
    return raw
  }

  async put(key: string, value: any): Promise<void> {
    const store = readStore()
    store[key] = typeof value === 'string' ? value : JSON.stringify(value)
    writeStore(store)
  }

  async delete(key: string): Promise<void> {
    const store = readStore()
    delete store[key]
    writeStore(store)
  }

  async list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: { name: string; expiration?: number; metadata?: any }[]
    list_complete: boolean
    cursor: string
  }> {
    const store = readStore()
    const prefix = options?.prefix || ''
    const allKeys = Object.keys(store).filter(k => k.startsWith(prefix))
    const limited = options?.limit ? allKeys.slice(0, options.limit) : allKeys
    return {
      keys: limited.map(k => ({ name: k })),
      list_complete: limited.length >= allKeys.length,
      cursor: ''
    }
  }
}
