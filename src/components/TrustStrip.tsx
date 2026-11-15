const ITEMS = [
  'WhatsApp Business API',
  'Google Business Profile',
  'Meta Cloud API',
  'Cal.com / Google Calendar',
  'HubSpot',
  'Zoho CRM',
  'Razorpay',
  'Instagram DM',
  'Twilio Voice',
]

/**
 * Marquee is CSS-driven (no JS ticker). Pauses on hover and on reduced motion
 * it degrades to a horizontally scrollable row.
 */
export function TrustStrip() {
  return (
    <section aria-label="Platforms Kairven integrates with" className="relative border-y border-white/[0.06] bg-[#08080b]">
      <div className="shell flex flex-col gap-4 py-6 md:flex-row md:items-center md:gap-10 md:py-7">
        <p className="mono-label shrink-0">Plugs into your stack</p>

        <div className="marquee-mask relative flex-1 overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-10 pr-10">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className="flex items-center gap-10"
                aria-hidden={copy === 1 ? true : undefined}
              >
                {ITEMS.map((item) => (
                  <li
                    key={`${copy}-${item}`}
                    className="flex items-center gap-10 whitespace-nowrap text-[0.82rem] tracking-[-0.01em] text-text-muted/80"
                  >
                    {item}
                    <span className="size-1 rounded-full bg-white/12" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-mask {
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .marquee-track {
          animation: marquee 42s linear infinite;
        }
        .marquee-mask:hover .marquee-track { animation-play-state: paused; }
        @keyframes marquee {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(-50%,0,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
          .marquee-mask { overflow-x: auto; }
        }
      `}</style>
    </section>
  )
}
