import type {IncomingMessage, ServerResponse} from 'node:http'
import type {Connect, Plugin} from 'vite'
import {onRequestPost} from './api/route-to-whatsapp'

/**
 * Dev/preview shim for the production serverless function.
 *
 * Production serves `api/route-to-whatsapp.ts` as a Cloudflare Pages Function
 * (see `_headers`/`wrangler.toml`). Locally there is no functions runtime, so
 * this middleware mounts the SAME handler at the same path — which means the
 * frontend code under test is identical in both environments and the WhatsApp
 * number still comes from the environment, never the bundle.
 */

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

const middleware: Connect.NextHandleFunction = async (req, res, next) => {
  const url = req.url ?? ''
  if (!url.startsWith('/api/route-to-whatsapp')) return next()

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('content-type', 'application/json')
    res.setHeader('allow', 'POST')
    res.end(JSON.stringify({error: 'Method not allowed'}))
    return
  }

  const raw = await readBody(req)
  const origin = req.headers.origin
  const host = req.headers.host ?? 'localhost'

  const request = new Request(`http://${host}${url}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(origin ? {origin: String(origin)} : {}),
    },
    body: raw,
  })

  const response = await onRequestPost({
    request,
    env: {
      KAIRVEN_WHATSAPP_NUMBER: process.env.KAIRVEN_WHATSAPP_NUMBER,
      KAIRVEN_WA_TOKEN: process.env.KAIRVEN_WA_TOKEN,
      KAIRVEN_WA_PHONE_ID: process.env.KAIRVEN_WA_PHONE_ID,
    },
  })

  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(await response.text())
}

export function auditEndpoint(): Plugin {
  return {
    name: 'kairven-audit-endpoint',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export type {ServerResponse}
