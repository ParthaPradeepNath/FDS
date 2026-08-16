import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import '@/lib/chart'
import api from '../api/client'
import RatingStars from '../components/RatingStars'
import StatusBadge from '../components/StatusBadge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  MessageSquareText,
  Star,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PALETTE = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/reports/overview')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
  }, [])

  if (error) {
    return (
      <div className="container">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-3 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  const ratingChart = {
    labels: data.ratingDistribution.map((r) => `${r.value} star${r.value === 1 ? '' : 's'}`),
    datasets: [
      {
        label: 'Submissions',
        data: data.ratingDistribution.map((r) => r.count),
        backgroundColor: PALETTE,
        borderRadius: 6,
      },
    ],
  }

  const categoryChart = {
    labels: data.byCategory.map((c) => c.name),
    datasets: [
      {
        label: 'Submissions',
        data: data.byCategory.map((c) => c.count),
        backgroundColor: PALETTE,
        borderWidth: 2,
      },
    ],
  }

  const trendChart = {
    labels: data.byDay.map((d) => d._id),
    datasets: [
      {
        label: 'Feedback per day',
        data: data.byDay.map((d) => d.count),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
      },
    ],
  }

  const statusEntries = Object.entries(data.statusCounts)
  const maxCategory = data.byCategory[0]
  const lowRated = data.ratingDistribution[0]?.count > data.total / 2

  const STATS = [
    {
      label: 'Total feedback',
      value: data.total,
      caption: 'all submissions',
      icon: ClipboardList,
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Average rating',
      value: `${data.averageRating.toFixed(1)}/5`,
      caption: `across ${data.total} submissions`,
      icon: Star,
      iconClass: 'bg-amber-500/10 text-amber-600',
      extra: <RatingStars value={Math.round(data.averageRating)} readOnly size="sm" />,
    },
    {
      label: 'Needs review',
      value: data.statusCounts.new,
      caption: 'new submissions to review',
      icon: MessageSquareText,
      iconClass: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Resolved',
      value: data.statusCounts.resolved,
      caption: `of ${data.total} total`,
      icon: TrendingUp,
      iconClass: 'bg-emerald-500/10 text-emerald-600',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of all feedback across the organization.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="hover:border-primary/30">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <span className={cn('inline-grid size-8 place-items-center rounded-lg', stat.iconClass)}>
                  <stat.icon className="size-4" />
                </span>
              </div>
              <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
              <div className="flex items-center gap-2">
                {stat.extra}
                <span className="text-xs text-muted-foreground">{stat.caption}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating distribution</CardTitle>
            <CardDescription>How submissions break down by star rating.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-72">
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
            <CardTitle className="text-base">Feedback by category</CardTitle>
            <CardDescription>Share of submissions across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-72">
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
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Feedback over time</CardTitle>
          <CardDescription>Daily submission trend.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-80">
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

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Review status</CardTitle>
              <CardDescription>Current distribution of review states.</CardDescription>
            </div>
            <Link
              to="/admin/feedback"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
            >
              Review feedback
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                <StatusBadge status={status} />
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attention needed</CardTitle>
            <CardDescription>Signals worth acting on.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {lowRated && data.total > 0 ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>
                  More than half of submissions are rated {data.ratingDistribution[0].value} star.
                  Early intervention recommended.
                </span>
              </div>
            ) : null}
            {maxCategory ? (
              <p className="text-sm text-muted-foreground">
                Most feedback is about{' '}
                <span className="font-medium text-foreground">{maxCategory.name}</span> (
                {maxCategory.count} submissions).
              </p>
            ) : null}
            <Link
              to="/admin/reports"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-1 w-fit gap-1.5')}
            >
              Explore reports
              <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent feedback</CardTitle>
            <CardDescription>Latest submissions across the organization.</CardDescription>
          </div>
          <Link
            to="/admin/feedback"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {data.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No feedback submitted yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {data.recent.map((item) => (
                <li key={item._id}>
                  <Link
                    to={`/feedback/${item._id}`}
                    className="group flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {item.categoryId?.name || 'General'}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.userId?.name}</span>
                      </div>
                      <p className="line-clamp-2 text-sm text-foreground/90 group-hover:text-primary">
                        {item.comment}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <RatingStars value={item.rating} readOnly size="sm" />
                      <StatusBadge status={item.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
