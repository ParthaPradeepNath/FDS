import { Fragment, useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    number: '01',
    title: 'Share feedback',
    description:
      'Rate an experience, choose a category, and leave a comment in under a minute.',
    type: 'form',
  },
  {
    number: '02',
    title: 'See what matters',
    description:
      'OneHub organizes every response by rating, category, and submission date.',
    type: 'list',
  },
  {
    number: '03',
    title: 'Turn insight into action',
    description:
      'Dashboards reveal satisfaction trends and recurring issues your team can address.',
    type: 'chart',
  },
]

function FormPreview() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Rate your experience</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          New
        </span>
      </div>
      <div className="mt-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'size-4',
              i < 4 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['Product', 'Service', 'Facilities'].map((c) => (
          <span
            key={c}
            className="rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
        Great session — loved the pace and examples.
      </div>
      <div className="mt-3 grid h-7 place-items-center rounded-lg bg-primary text-[11px] font-semibold text-primary-foreground">
        Submit feedback
      </div>
    </div>
  )
}

const ROWS = [
  { name: 'Product', stars: 4, count: 412, pct: 92 },
  { name: 'Service', stars: 4, count: 318, pct: 71 },
  { name: 'Staff', stars: 3, count: 194, pct: 43 },
]

function ListPreview() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">Rating by category</p>
      <div className="mt-3 space-y-2.5">
        {ROWS.map((r) => (
          <div key={r.name} className="flex items-center gap-2.5">
            <span className="w-14 shrink-0 truncate text-[11px] font-medium">{r.name}</span>
            <span className="flex gap-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-3',
                    i < r.stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
                  )}
                />
              ))}
            </span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${r.pct}%` }} />
            </div>
            <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
              {r.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const BARS = [42, 58, 50, 72, 66, 84, 96]

function ChartPreview() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Satisfaction trend</p>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          +18%
        </span>
      </div>
      <svg viewBox="0 0 220 64" className="mt-3 h-16 w-full" aria-hidden="true">
        <defs>
          <linearGradient id="hiw-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#84cc16" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
          </linearGradient>
        </defs>
        {BARS.map((h, i) => (
          <rect
            key={i}
            x={i * 30 + 8}
            y={64 - h}
            width={16}
            height={h}
            rx={3}
            fill={i === BARS.length - 1 ? '#65a30d' : 'rgba(132, 204, 22, 0.35)'}
          />
        ))}
        <polyline
          points={BARS.map((h, i) => `${i * 30 + 16},${64 - h}`).join(' ')}
          fill="none"
          stroke="#65a30d"
          strokeWidth={2}
        />
      </svg>
    </div>
  )
}

const PREVIEWS = {
  form: <FormPreview />,
  list: <ListPreview />,
  chart: <ChartPreview />,
}

function slideStyle(index, progress) {
  const steps = STEPS.length
  const start = index / steps
  const end = (index + 1) / steps
  const inEnd = 0.35
  const outStart = 0.65
  let local = (progress - start) / (end - start)
  if (index === 0) local = Math.max(local, inEnd)
  if (index === steps - 1) local = Math.min(local, outStart)
  if (local <= 0 || local >= 1) return { opacity: 0, y: 0, pointerEvents: 'none' }
  let opacity = 1
  let y = 0
  if (local < inEnd) {
    const t = local / inEnd
    opacity = t
    y = (1 - t) * 56
  } else if (local > outStart) {
    const t = (local - outStart) / (1 - outStart)
    opacity = 1 - t
    y = -t * 56
  }
  return { opacity, y, pointerEvents: 'none' }
}

export default function HowItWorks() {
  const wrapRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let ticking = false
    const update = () => {
      ticking = false
      const total = wrap.offsetHeight - window.innerHeight
      if (total <= 0) return
      const rect = wrap.getBoundingClientRect()
      const scrolled = Math.max(0, Math.min(-rect.top, total))
      setProgress(scrolled / total)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const steps = STEPS.length
  const activeIndex = Math.min(steps - 1, Math.max(0, Math.floor(progress * steps)))

  return (
    <div ref={wrapRef} className="relative h-[180vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-4 pt-16 pb-6 md:pt-20">
        <div className="mx-auto mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            From sharing feedback to acting on it in three simple steps.
          </p>
        </div>

        <div className="relative min-h-0 flex-1">
          {STEPS.map((step, i) => {
            const s = slideStyle(i, progress)
            return (
              <div
                key={step.number}
                style={{ opacity: s.opacity, transform: `translate3d(0, ${s.y}px, 0)`, pointerEvents: s.pointerEvents }}
                className="absolute inset-0 grid place-items-center"
              >
                <div className="grid w-full max-w-3xl items-center gap-8 md:grid-cols-2 md:gap-14">
                  <div>
                    <span className="text-5xl font-bold tracking-tighter text-primary/15 md:text-6xl">
                      {step.number}
                    </span>
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {step.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-full justify-self-center md:max-w-[300px]',
                      i === steps - 1 && 'rounded-2xl shadow-[0_20px_50px_-20px_rgba(154,230,0,0.45)]',
                    )}
                  >
                    {PREVIEWS[step.type]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mx-auto flex w-full max-w-xs items-center">
          {STEPS.map((step, i) => {
            const active = i === activeIndex
            const passed = i < activeIndex
            return (
              <Fragment key={step.number}>
                {i > 0 && (
                  <div className="relative mx-1.5 h-px flex-1 overflow-hidden bg-border">
                    <div
                      data-fill
                      className="absolute inset-y-0 left-0 bg-primary"
                      style={{
                        width: `${Math.max(0, Math.min(100, (progress * steps - i) * 100))}%`,
                      }}
                    />
                  </div>
                )}
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold transition-colors duration-300',
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_18px_-2px_rgba(154,230,0,0.6)]'
                      : passed
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground',
                  )}
                >
                  {step.number}
                </span>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
