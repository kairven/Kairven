export interface AuditRequest {
  name: string
  business?: string
  painPoint: string
}

/**
 * Asks the serverless function for a wa.me link, then opens it.
 * The number is never present in this bundle — only the redirect URL is.
 */
export async function routeToWhatsApp(payload: AuditRequest, signal?: AbortSignal) {
  const res = await fetch("/api/route-to-whatsapp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Routing failed (${res.status})`)
  }

  const { redirect } = (await res.json()) as { redirect: string }

  // Only follow same-scheme, WhatsApp-owned URLs — a compromised or
  // misconfigured endpoint should not be able to send users anywhere.
  const url = new URL(redirect)
  if (url.protocol !== "https:" || !/(^|\.)wa\.me$/.test(url.hostname)) {
    throw new Error("Unexpected redirect target")
  }

  window.open(url.toString(), "_blank", "noopener,noreferrer")
  return url.toString()
}
