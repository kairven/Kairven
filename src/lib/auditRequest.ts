export type AuditPayload = {
  name: string
  business: string
  painPoint: string
}

export type AuditResult =
  | {ok: true; redirect: string}
  | {ok: false; message: string}

/**
 * Client half of 4d. Posts the diagnostic to a same-origin serverless function
 * and follows whatever redirect URL it hands back.
 *
 * The phone number is never present in this bundle — only the endpoint path.
 */
export async function requestAuditRoute(
  payload: AuditPayload,
  signal?: AbortSignal,
): Promise<AuditResult> {
  try {
    const res = await fetch('/api/route-to-whatsapp', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(payload),
      signal,
    })

    if (!res.ok) {
      let message = 'Something went wrong on our side.'
      try {
        const data = (await res.json()) as {error?: string}
        if (data?.error) message = data.error
      } catch {
        /* non-JSON error body */
      }
      if (res.status === 503) {
        message = 'WhatsApp routing is not live yet — the team has been notified.'
      }
      return {ok: false, message}
    }

    const data = (await res.json()) as {redirect?: string}
    if (!data?.redirect) {
      return {ok: false, message: 'Routing endpoint returned no destination.'}
    }
    return {ok: true, redirect: data.redirect}
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') {
      return {ok: false, message: 'Request cancelled.'}
    }
    return {ok: false, message: 'Network error — check your connection and retry.'}
  }
}
