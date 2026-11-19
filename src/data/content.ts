/**
 * ============================================================================
 *  ⚠️  PLACEHOLDER DATA — REPLACE BEFORE LAUNCH
 * ============================================================================
 *  Everything below marked [PLACEHOLDER] is illustrative copy written to give
 *  the layout real density. It is NOT verified client data.
 *
 *  Publishing invented testimonials, client names or performance figures is a
 *  legal and reputational problem (consumer-protection rules in India treat
 *  unsupported claims as misleading advertising). Replace each one with a real,
 *  permissioned result before this site goes public.
 *
 *  A dev-only console warning fires while PLACEHOLDER_DATA_IS_REAL is false.
 * ============================================================================
 */
export const PLACEHOLDER_DATA_IS_REAL = false

export const NAV_LINKS = [
  {id: 'system', label: 'System'},
  {id: 'sandbox', label: 'Live demo'},
  {id: 'architecture', label: 'Architecture'},
  {id: 'pricing', label: 'Pricing'},
  {id: 'origin', label: 'Origin'},
] as const

/** 4a — the four-stage signal path, in order. */
export const SIGNAL_STAGES = [
  {
    id: 'capture',
    index: '01',
    title: 'Capture',
    blurb:
      'Every inbound touchpoint — WhatsApp, missed call, form, Google Business Message, Instagram DM — lands in one webhook instead of five inboxes nobody checks.',
    metric: '8 sources',
  },
  {
    id: 'qualify',
    index: '02',
    title: 'Qualify',
    blurb:
      'A deterministic intent layer scores the lead against your service list, service area and budget band, then routes it. No “AI maybe” — explicit rules, auditable.',
    metric: '0.9s',
  },
  {
    id: 'book',
    index: '03',
    title: 'Book',
    blurb:
      'Available slots are offered from your live calendar, the booking is written back, and both sides get a confirmation with a reschedule path.',
    metric: '+31% show',
  },
  {
    id: 'retain',
    index: '04',
    title: 'Retain',
    blurb:
      'Reminders, no-show recovery, review requests and reactivation drips on the same graph — so the pipeline keeps refilling after the campaign stops.',
    metric: '4.6× LTV',
  },
] as const

/** 4b — scripted, deterministic demo. Never a live API call. */
/** [PLACEHOLDER] Scripted demo transcript — safe to keep, it's clearly labelled
 *  as a simulation in the UI. No real customer data is used. */
export const CHAT_SCRIPT: {
  from: 'customer' | 'kairven'
  text: string
  delay: number
}[] = [
  {from: 'customer', text: 'Hi, do you have availability tomorrow?', delay: 0},
  {from: 'kairven', text: 'Yes — 10 AM, 2 PM or 4 PM work. Which suits you?', delay: 1200},
  {from: 'customer', text: '2 PM please', delay: 2400},
  {from: 'kairven', text: 'Booked! Confirmation sent. ✅', delay: 1200},
]

export const ARCH_PANELS = [
  {
    id: 'ingress',
    eyebrow: 'Layer 01',
    title: 'Ingress',
    body: 'A single normalising gateway. WhatsApp Cloud API, missed-call webhooks, forms and DMs are mapped to one canonical lead object with source, timestamp and intent — no duplicate records, no source ambiguity.',
    points: ['Signature-verified webhooks', 'Idempotent writes', 'Sub-90ms edge ingestion'],
  },
  {
    id: 'intent',
    eyebrow: 'Layer 02',
    title: 'Intent',
    body: 'The scoring graph. Service fit, geography, urgency language and returning-customer history resolve into a routing decision you can read line by line in a log — not a black box.',
    points: ['Rule graph + LLM extraction', 'Confidence thresholds', 'Human handoff on ambiguity'],
  },
  {
    id: 'response',
    eyebrow: 'Layer 03',
    title: 'Response',
    body: 'Replies are composed from your real availability and sent inside the platform the customer already uses. Median first response moves from hours to under a minute, around the clock.',
    points: ['Live calendar read/write', 'Template + freeform fallback', 'Bilingual by default'],
  },
  {
    id: 'ledger',
    eyebrow: 'Layer 04',
    title: 'Ledger',
    body: 'Every message, decision and booking is written to a durable ledger. Attribution, follow-up and reactivation all read from the same source of truth, so your dashboard can’t disagree with reality.',
    points: ['Immutable event log', 'CRM mirror', 'Review + referral automation'],
  },
] as const

/** [PLACEHOLDER] Before/after aggregates. See note at top of file. */
export const COMPARISON = [
  {
    dimension: 'First response time',
    before: '4h 11m average, often next day',
    after: '38 seconds, any hour',
  },
  {
    dimension: 'After-hours enquiries',
    before: 'Lost to voicemail',
    after: 'Captured and booked',
  },
  {
    dimension: 'Where leads live',
    before: 'WhatsApp, phone notes, a spreadsheet',
    after: 'One ledger, mirrored to CRM',
  },
  {
    dimension: 'Follow-up',
    before: 'Manual, when remembered',
    after: 'Automated sequences with stop rules',
  },
  {
    dimension: 'Search presence',
    before: 'Unclaimed profile, no reviews strategy',
    after: 'Structured data, reviews, AI-cited answers',
  },
  {
    dimension: 'Attribution',
    before: '“We think it was the ads”',
    after: 'Source-level, per booked appointment',
  },
] as const

export const PRICING = [
  {
    id: 'signal',
    name: 'Signal',
    tagline: 'For a single location finding its footing.',
    inr: 24000,
    usd: 290,
    cadence: '/mo',
    setup: 'Setup ₹18,000 one-time',
    features: [
      'WhatsApp + missed-call capture',
      'AI front desk, 1 channel',
      'Calendar booking sync',
      'Weekly performance digest',
    ],
    featured: false,
  },
  {
    id: 'autonomous',
    name: 'Autonomous',
    tagline: 'The full front desk, running without you.',
    inr: 56000,
    usd: 670,
    cadence: '/mo',
    setup: 'Setup ₹32,000 one-time',
    features: [
      'Everything in Signal',
      'All channels unified',
      'CRM pipeline + ledger',
      'Review & reactivation automation',
      'Local SEO / GEO maintenance',
      'Monthly strategy call',
    ],
    featured: true,
  },
  {
    id: 'compound',
    name: 'Compound',
    tagline: 'Multi-location operators and clinic groups.',
    inr: 118000,
    usd: 1420,
    cadence: '/mo',
    setup: 'Scoped per site',
    features: [
      'Everything in Autonomous',
      'Up to 6 locations, split routing',
      'Custom intent graph + QA harness',
      'Dedicated automation engineer',
      'Attribution warehouse access',
    ],
    featured: false,
  },
] as const

export const FAQS = [
  {
    q: 'What does Kairven actually build?',
    a: 'Kairven builds and operates the digital infrastructure that sits between a business and its customers: an AI front desk that answers and books, a unified lead ledger with CRM sync, and search visibility work so the business is found and cited. It is delivered as a managed service, not a DIY tool.',
  },
  {
    q: 'Which businesses does Kairven work with?',
    a: 'Kairven focuses on appointment-driven local businesses in India — dental and dermatology clinics, diagnostics labs, home services such as HVAC, plumbing and interior work, and similar operators where a missed enquiry is a missed booking.',
  },
  {
    q: 'How fast can the AI front desk be live?',
    a: 'A single-location deployment typically goes live within 10 to 14 working days from kickoff. That window covers WhatsApp Business API verification, calendar mapping, intent-graph configuration and a scripted QA pass before anything is connected to real customers.',
  },
  {
    q: 'Does the AI talk to customers without a human?',
    a: 'It handles the high-frequency, low-ambiguity path — availability, pricing bands, service-area checks, booking, confirmation and rescheduling. Anything outside the configured confidence threshold is handed to a human with full conversation context instead of being guessed at.',
  },
  {
    q: 'Where is the business located?',
    a: 'Kairven is based in Kanpur, Uttar Pradesh, India, and serves clients across India remotely. The founder is Mohammad Sameer Khan.',
  },
  {
    q: 'What happens in the free diagnostic?',
    a: 'You share your name, business and the single biggest leak in your lead flow. Kairven responds with a concrete audit of your capture, response and follow-up path, plus the two changes that would recover the most bookings. No obligation to continue.',
  },
] as const

/** [PLACEHOLDER] Headline metrics. Replace with figures you can evidence. */
export const METRICS = [
  {value: 38, suffix: 's', label: 'Median first response', decimals: 0},
  {value: 4, suffix: 'h', label: 'Previous baseline', decimals: 0},
  {value: 91, suffix: '%', label: 'Enquiries answered after hours', decimals: 0},
  {value: 7.4, suffix: '×', label: 'Booked-appointment lift', decimals: 1},
] as const
