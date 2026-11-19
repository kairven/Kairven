import {lazy, Suspense, type ComponentType} from 'react'

type CountUpProps = {
  end: number
  start?: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  separator?: string
  preserveValue?: boolean
  enableScrollSpy?: boolean
  scrollSpyOnce?: boolean
  className?: string
}

/**
 * `react-countup` ships a CJS build whose default export is reassigned onto
 * `exports.default`. Depending on the bundler's interop layer, `import CountUp
 * from 'react-countup'` can resolve to the namespace object instead of the
 * component — which crashes the tree with "Element type is invalid".
 *
 * This shim unwraps whichever shape we get, so a bundler upgrade can't take
 * the hero metrics and the pricing counter down with it.
 */
function unwrap(mod: unknown): ComponentType<CountUpProps> {
  let candidate = mod as
    | {default?: unknown}
    | ComponentType<CountUpProps>
    | undefined

  // Walk at most two `.default` hops (esModule -> default -> component).
  for (let i = 0; i < 3; i++) {
    if (typeof candidate === 'function') return candidate as ComponentType<CountUpProps>
    if (candidate && typeof candidate === 'object' && 'default' in candidate) {
      candidate = (candidate as {default?: unknown}).default as typeof candidate
      continue
    }
    break
  }
  throw new Error('[CountUp] could not resolve the react-countup component export')
}

const CountUpLazy = lazy(() =>
  import('react-countup').then((mod) => ({default: unwrap(mod)})),
)

type Props = {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
  /** Render the final value immediately (no tween) — used for SSR/no-JS safety. */
  staticValue?: string
}

function formatStatic(
  value: number,
  prefix = '',
  suffix = '',
  decimals = 0,
) {
  return `${prefix}${value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`
}

/**
 * `preserveValue` is mandatory: without it CountUp remounts from 0 on every
 * currency/state change instead of tweening between the two values.
 */
export function CountUpValue({
  value,
  prefix,
  suffix,
  decimals = 0,
  duration = 0.6,
  className,
  staticValue,
}: Props) {
  return (
    <span className={className}>
      <Suspense
        fallback={
          <span>{staticValue ?? formatStatic(value, prefix, suffix, decimals)}</span>
        }
      >
        <CountUpLazy
          end={value}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          separator=","
          preserveValue
          // Render the real number on first paint so the metric is never blank
          // in a screenshot or for a no-JS crawler.
          start={value}
        />
      </Suspense>
    </span>
  )
}

export {unwrap as __resolveCountUp}
