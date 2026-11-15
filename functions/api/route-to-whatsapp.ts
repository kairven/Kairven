/**
 * Cloudflare Pages Function — POST /api/route-to-whatsapp
 *
 * The `functions/` directory lives at the REPO ROOT, not in dist, and not
 * inside the uploaded asset directory. Wrangler compiles it into the Worker and
 * routes by file path: functions/api/route-to-whatsapp.ts → /api/route-to-whatsapp.
 *
 * Why this duplication exists: the sibling `api/route-to-whatsapp.ts` uses the
 * Vercel Edge `export default handler` signature. Pages Functions use
 * `onRequest<Method>` named exports, so the same logic cannot be shared as one
 * file without a build step. Whichever platform you settle on, delete the
 * other file — leaving both invites two endpoints drifting apart.
 *
 * Note also: `_headers` does NOT apply to Function responses. Any header this
 * route needs must be set on the Response itself, which is why cache-control
 * is explicit below.
 */

interface Env {
  KAIRVEN_WHATSAPP_NUMBER?: string
}

interface Payload {
  name?: unknown
  business?: unknown
  painPoint?: unknown
}

function str(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : ""
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  })

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return json({ error: "Invalid JSON body" }, 400)
  }

  const name = str(body.name, 80)
  const business = str(body.business, 120)
  const painPoint = str(body.painPoint, 600)

  if (!name || !painPoint) {
    return json({ error: "name and painPoint are required" }, 422)
  }

  // Digits only — wa.me rejects `+`, spaces and dashes in the path.
  const waNumber = (env.KAIRVEN_WHATSAPP_NUMBER ?? "").replace(/\D/g, "")

  if (!waNumber) {
    console.error("[route-to-whatsapp] KAIRVEN_WHATSAPP_NUMBER is unset")
    return json({ error: "Routing unavailable" }, 503)
  }

  const text = encodeURIComponent(
    `New audit request: ${name} — ${business || "n/a"} — ${painPoint}`
  )

  return json({ redirect: `https://wa.me/${waNumber}?text=${text}` })
}

// `onRequest` runs for every method except those with a more specific handler
// (onRequestPost above). Without it, a GET would fall through to the static
// asset handler and return the SPA shell with a 200.
export const onRequest: PagesFunction<Env> = async () =>
  json({ error: "Method not allowed" }, 405)
