import { Bar, Doughnut, Line } from 'react-chartjs-2'
import '@/lib/chart'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import RatingStars from './RatingStars'
import StatusBadge from './StatusBadge'
import {
  ClipboardList,
  Lock,
  MessageSquareText,
  Star,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { stagger, fadeUp } from '@/lib/motion'

const PALETTE = ['#84cc16', '#22c55e', '#14b8a6', '#f59e0b', '#8b5cf6']

const STATS = [
  {
    label: 'Total feedback',
    value: '1,284',
    caption: 'all submissions',
    icon: ClipboardList,
    iconClass: 'bg-primary/10 text-primary',
  },
  {
    label: 'Average rating',
    value: '4.2/5',
    caption: 'across 1,284 submissions',
    icon: Star,
    iconClass: 'bg-amber-500/10 text-amber-600',
    extra: <RatingStars value={4} readOnly size="sm" />,
  },
  {
    label: 'Needs review',
    value: '12',
    caption: 'new submissions',
    icon: MessageSquareText,
    iconClass: 'bg-blue-500/10 text-blue-600',
  },
  {
    label: 'Resolved',
    value: '1,190',
    caption: 'of 1,284 total',
    icon: TrendingUp,
    iconClass: 'bg-emerald-500/10 text-emerald-600',
  },
]

const DAYS = ['Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11', 'Aug 12', 'Aug 13', 'Aug 14', 'Aug 15']

const RECENT = [
  {
    category: 'Product',
    name: 'Priya Sharma',
    comment: 'The new onboarding flow feels much smoother now.',
    rating: 5,
    status: 'resolved',
  },
  {
    category: 'Service',
    name: 'Arjun Mehta',
    comment: 'Wait times during peak hours could definitely be shorter.',
    rating: 3,
    status: 'new',
  },
]

const ratingChart = {
  labels: ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'],
  datasets: [
    {
      label: 'Submissions',
      data: [38, 54, 112, 294, 786],
      backgroundColor: '#84cc16',
      borderRadius: 6,
    },
  ],
}

const categoryChart = {
  labels: ['Product', 'Service', 'Staff', 'Facilities', 'Other'],
  datasets: [
    {
      label: 'Submissions',
      data: [412, 318, 194, 142, 218],
      backgroundColor: PALETTE,
      borderWidth: 2,
    },
  ],
}

const trendChart = {
  labels: DAYS,
  datasets: [
    {
      label: 'Feedback per day',
      data: [18, 22, 19, 25, 27, 24, 30, 28, 34, 37, 33, 41, 44, 48],
      borderColor: '#65a30d',
      backgroundColor: 'rgba(132, 204, 22, 0.14)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
}

export default function DashboardPreview() {
  return (
    <section className="mx-auto mt-20 max-w-6xl">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="mx-auto max-w-2xl text-center"
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          Dashboard preview
        </motion.span>
        <motion.h2 variants={fadeUp} className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          See every voice at a glance
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
          Ratings, categories, and trends in one clean dashboard — so administrators can spot
          what matters and act on it fast.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mt-24 pb-14"
      >
        <div className="rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5 sm:p-3">
          <div className="flex items-center gap-2 rounded-t-xl border-b px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-red-400" />
              <span className="size-3 rounded-full bg-amber-400" />
              <span className="size-3 rounded-full bg-green-400" />
            </div>
            <div className="mx-auto flex items-center gap-1.5 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Lock className="size-3" />
              onehub.app/admin
            </div>
            <div className="w-14" aria-hidden="true" />
          </div>

          <div className="max-h-[calc(80vh-7rem)] overflow-y-auto rounded-xl border bg-background p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold tracking-tight">Admin Dashboard</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Overview of all feedback across the organization.
              </p>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="flex flex-col gap-1.5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                      <span className={cn('inline-grid size-7 place-items-center rounded-lg', stat.iconClass)}>
                        <stat.icon className="size-3.5" />
                      </span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                    <div className="flex items-center gap-2">
                      {stat.extra}
                      <span className="text-xs text-muted-foreground">{stat.caption}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rating distribution</CardTitle>
                  <CardDescription>Submissions by star rating.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-32">
                    <Bar
                      data={ratingChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">By category</CardTitle>
                  <CardDescription>Share of submissions per category.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-32">
                    <Doughnut
                      data={categoryChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Feedback over time</CardTitle>
                  <CardDescription>Daily submission trend.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-32">
                    <Line
                      data={trendChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent feedback</CardTitle>
                <CardDescription>Latest submissions across the organization.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col divide-y">
                  {RECENT.map((item) => (
                    <li key={item.comment} className="flex flex-wrap items-center justify-between gap-3 py-2">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {item.category}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                        <p className="line-clamp-2 text-sm text-foreground/90">{item.comment}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <RatingStars value={item.rating} readOnly size="sm" />
                        <StatusBadge status={item.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
