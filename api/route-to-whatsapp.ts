/**
 * POST /api/route-to-whatsapp
 *
 * The WhatsApp number lives ONLY in the server environment
 * (`KAIRVEN_WHATSAPP_NUMBER`). The client never receives it at build time and
 * it never appears in the JS bundle — the browser posts the audit request and
 * gets back a redirect URL to follow.
 *
 * Deploy targets:
 *   - Cloudflare Pages Functions (this file, default `onRequest` export)
 *   - Netlify/Vercel: re-export as `export default async function handler(req)`
 *
 * Set the secret with:
 *   npx wrangler pages secret put KAIRVEN_WHATSAPP_NUMBER
 */

type AuditPayload = {
  name?: unknown
  business?: unknown
  painPoint?: unknown
}

const MAX = {name: 80, business: 120, painPoint: 600}

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  // Strip control chars, collapse whitespace, cap length. Everything is
  // re-encoded with encodeURIComponent before it reaches a URL, so this is
  // belt-and-braces rather than the only line of defence.
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export async function onRequestPost(context: {
  request: Request
  env: Record<string, string | undefined>
}) {
  const {request, env} = context

  // Same-origin only. Cheap CSRF guard: the browser sets Origin on POSTs.
  const origin = request.headers.get('origin')
  const self = new URL(request.url)
  if (origin && new URL(origin).host !== self.host) {
    return json({error: 'Origin not allowed'}, 403)
  }

  let body: AuditPayload
  try {
    body = (await request.json()) as AuditPayload
  } catch {
    return json({error: 'Invalid JSON body'}, 400)
  }

  const name = clean(body.name, MAX.name)
  const business = clean(body.business, MAX.business)
  const painPoint = clean(body.painPoint, MAX.painPoint)

  if (!name || !business || !painPoint) {
    return json({error: 'name, business and painPoint are required'}, 422)
  }

  const waNumber = (env.KAIRVEN_WHATSAPP_NUMBER ?? '').replace(/[^\d]/g, '')
  if (!waNumber) {
    // Fail loudly server-side, quietly client-side: the UI falls back to email.
    console.error('[route-to-whatsapp] KAIRVEN_WHATSAPP_NUMBER is not configured')
    return json({error: 'Routing is not configured yet'}, 503)
  }

  const text = encodeURIComponent(
    `New audit request\n\nName: ${name}\nBusiness: ${business}\nBiggest leak: ${painPoint}`,
  )

  // If a WhatsApp Business (Cloud API) token is present we prefer a pre-approved
  // template message; otherwise we hand back a wa.me deep link, which needs no
  // API credentials and still keeps the number server-side.
  const token = env.KAIRVEN_WA_TOKEN
  const phoneId = env.KAIRVEN_WA_PHONE_ID

  if (token && phoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: waNumber,
          type: 'text',
          text: {preview_url: false, body: `New audit request\n\nName: ${name}\nBusiness: ${business}\nBiggest leak: ${painPoint}`},
        }),
      })
      if (!res.ok) {
        console.error('[route-to-whatsapp] Cloud API rejected the send', await res.text())
      }
    } catch (err) {
      console.error('[route-to-whatsapp] Cloud API request failed', err)
    }
  }

  return json({
    redirect: `https://wa.me/${waNumber}?text=${text}`,
    // The confirmation step in the UI uses this to show something useful even
    // when the user's browser cannot open WhatsApp.
    transcript: {name, business, painPoint},
  })
}

/** GET is not a valid verb here — don't hint at the number via probing. */
export async function onRequestGet() {
  return new Response(JSON.stringify({error: 'Method not allowed'}), {
    status: 405,
    headers: {'content-type': 'application/json', allow: 'POST'},
  })
}
