import { useEffect, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import '@/lib/chart'
import api from '../api/client'
import DatePicker from '@/components/DatePicker'
import { Button } from '@/components/ui/button'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, BarChart3, RotateCcw } from 'lucide-react'

const PALETTE = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const INITIAL_FILTERS = { category: '', startDate: '', endDate: '' }

export default function Reports() {
  const [categories, setCategories] = useState([])
  const [draft, setDraft] = useState({ ...INITIAL_FILTERS })
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS })
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const loading = data === null && !error

  useEffect(() => {
    let active = true
    api
      .get('/categories')
      .then(({ data }) => {
        if (active) setCategories(data.categories)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const params = {
      category: filters.category || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    }
    api
      .get('/reports', { params })
      .then(({ data }) => {
        if (active) setData(data)
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load reports')
      })
    return () => {
      active = false
    }
  }, [filters])

  const beginRefetch = () => {
    setError('')
    setData(null)
  }

  const handleApply = (e) => {
    e.preventDefault()
    beginRefetch()
    setFilters({ ...draft })
  }

  const handleReset = () => {
    beginRefetch()
    setDraft({ ...INITIAL_FILTERS })
    setFilters({ ...INITIAL_FILTERS })
  }

  if (error) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  const hasData = data && data.byCategory.length > 0

  const ratingChart = {
    labels: data?.ratingDistribution.map((r) => `${r.value} star${r.value === 1 ? '' : 's'}`),
    datasets: [
      {
        label: 'Submissions',
        data: data?.ratingDistribution.map((r) => r.count),
        backgroundColor: PALETTE,
        borderRadius: 6,
      },
    ],
  }

  const categoryChart = {
    labels: data?.byCategory.map((c) => c.name),
    datasets: [
      {
        label: 'Submissions',
        data: data?.byCategory.map((c) => c.count),
        backgroundColor: PALETTE,
        borderRadius: 6,
      },
      {
        label: 'Average rating (scaled ×20)',
        data: data?.byCategory.map((c) => c.averageRating * 20),
        type: 'line',
        borderColor: '#0f172a',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointBackgroundColor: '#0f172a',
        tension: 0.3,
      },
    ],
  }

  const trendChart = {
    labels: data?.byDay.map((d) => d._id),
    datasets: [
      {
        label: 'Feedback count',
        data: data?.byDay.map((d) => d.count),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        fill: true,
        tension: 0.35,
      },
      {
        label: 'Average rating',
        data: data?.byDay.map((d) => d.avg),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        tension: 0.35,
      },
    ],
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze satisfaction trends, ratings, and categories.
        </p>
      </div>

      <form onSubmit={handleApply} className="mb-6">
        <Card>
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select
                  items={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]}
                  value={draft.category || 'all'}
                  onValueChange={(v) => setDraft((f) => ({ ...f, category: v === 'all' ? '' : v }))}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c._id, label: c.name }))].map(
                      (item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>From</Label>
                <DatePicker
                  value={draft.startDate}
                  onChange={(v) => setDraft((f) => ({ ...f, startDate: v }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>To</Label>
                <DatePicker
                  value={draft.endDate}
                  onChange={(v) => setDraft((f) => ({ ...f, endDate: v }))}
                />
              </div>
              <div className="flex items-end gap-2">
                <StatefulButton
                  type="submit"
                  onClick={handleApply}
                  className="h-9 flex-1 bg-primary text-primary-foreground hover:ring-primary"
                >
                  Apply
                </StatefulButton>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-3"
                  onClick={handleReset}
                  aria-label="Reset filters"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-5 w-40" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-5 w-40" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-5 w-40" />
              <Skeleton className="h-72 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <span className="inline-grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <BarChart3 className="size-7" />
          </span>
          <h2 className="text-lg font-semibold">No data for this report</h2>
          <p className="text-sm text-muted-foreground">
            Try changing the filters or submit some feedback first.
          </p>
        </div>
      ) : (
        <>
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
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Submissions & average rating by category</CardTitle>
                <CardDescription>Volume and satisfaction per category.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-72">
                  <Bar
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
              <CardTitle className="text-base">Trends over time</CardTitle>
              <CardDescription>Daily submission volume and average rating.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80">
                <Line
                  data={trendChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Low-rated areas</CardTitle>
                <CardDescription>Categories averaging below 2.5 stars.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.lowRated.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    No categories average below 2.5 stars.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {data.lowRated.map((c) => (
                      <li
                        key={c.name}
                        className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-3.5 py-2.5 text-sm font-medium"
                      >
                        <span>{c.name}</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {c.averageRating.toFixed(1)} ★
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comment length by rating</CardTitle>
                <CardDescription>Average character count per rating level.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {data.ratingDistribution
                  .filter((r) => r.avgCommentLen > 0)
                  .map((r) => (
                    <div key={r.value} className="grid grid-cols-[72px_1fr_56px] items-center gap-3 text-sm">
                      <span>
                        {r.value} star{r.value === 1 ? '' : 's'}
                      </span>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-lime-700"
                          style={{ width: `${Math.min((r.avgCommentLen / 400) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-right text-muted-foreground">{r.avgCommentLen} chars</span>
                    </div>
                  ))}
                {data.ratingDistribution.every((r) => r.avgCommentLen === 0) && (
                  <p className="py-2 text-sm text-muted-foreground">No comment data available.</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Longer comments often signal stronger sentiment — review high-detail submissions
                  first.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
