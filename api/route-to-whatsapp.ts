/**
 * POST /api/route-to-whatsapp
 *
 * Returns a wa.me deep link with the number injected server-side. The point is
 * that KAIRVEN_WHATSAPP_NUMBER never enters the client bundle — a number in JS
 * is scraped within days and then you're fielding spam on your business line.
 *
 * Runtime notes:
 *  - `export const config = { runtime: 'edge' }` makes this a Web `Request` →
 *    `Response` handler on Vercel. Without it, the default Node runtime hands
 *    you `(req, res)` and `req.json()` does not exist.
 *  - Netlify uses a slightly different signature (`(req: Request) => Response`
 *    with `export default` in `netlify/functions/`), Cloudflare Workers use
 *    `export default { fetch(req, env) }`. The body below is portable.
 */

export const config = { runtime: "edge" }

interface Payload {
  name?: unknown
  business?: unknown
  painPoint?: unknown
}

function str(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : ""
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = str(body.name, 80)
  const business = str(body.business, 120)
  const painPoint = str(body.painPoint, 600)

  if (!name || !painPoint) {
    return Response.json({ error: "name and painPoint are required" }, { status: 422 })
  }

  // Digits only. WhatsApp rejects `+`, spaces and dashes in the wa.me path —
  // a plain E.164 value like +91 98765 43210 must become 919876543210.
  const raw = process.env.KAIRVEN_WHATSAPP_NUMBER ?? ""
  const waNumber = raw.replace(/\D/g, "")

  if (!waNumber) {
    // Fail loudly on the server, quietly to the client: never leak config state.
    console.error("[route-to-whatsapp] KAIRVEN_WHATSAPP_NUMBER is unset")
    return Response.json({ error: "Routing unavailable" }, { status: 503 })
  }

  const text = encodeURIComponent(
    `New audit request: ${name} — ${business || "n/a"} — ${painPoint}`
  )

  return Response.json(
    { redirect: `https://wa.me/${waNumber}?text=${text}` },
    { headers: { "cache-control": "no-store" } }
  )
}
