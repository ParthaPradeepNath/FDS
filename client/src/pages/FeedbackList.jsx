import { useEffect, useState, useDeferredValue } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import RatingStars from '../components/RatingStars'
import StatusBadge from '../components/StatusBadge'
import SentimentBadge from '../components/SentimentBadge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Search, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_OPTIONS } from '@/lib/constants'

const ALL_OPTIONS = {
  category: 'all-categories',
  status: 'all-statuses',
  rating: 'any-rating',
}

const SORT_ITEMS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'rating-desc', label: 'Highest rating' },
  { value: 'rating-asc', label: 'Lowest rating' },
]

export default function FeedbackList() {
  const [feedback, setFeedback] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sort, setSort] = useState('newest')

  const loading = feedback === null && !error

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
      search: deferredSearch || undefined,
      category: category || undefined,
      status: status || undefined,
      minRating: minRating || undefined,
      sort: sort || undefined,
    }
    api
      .get('/feedback', { params })
      .then(({ data }) => {
        if (active) setFeedback(data.feedback)
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load feedback')
      })
    return () => {
      active = false
    }
  }, [deferredSearch, category, status, minRating, sort])

  const beginRefetch = () => {
    setError('')
    setFeedback(null)
  }

  const handleReset = () => {
    beginRefetch()
    setSearch('')
    setCategory('')
    setStatus('')
    setMinRating('')
    setSort('newest')
  }

  const hasFilters = search || category || status || minRating

  const categoryItems = [
    { value: ALL_OPTIONS.category, label: 'All categories' },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ]
  const statusItems = [
    { value: ALL_OPTIONS.status, label: 'All statuses' },
    ...STATUS_OPTIONS.map((s) => ({
      value: s.value,
      label: s.label,
    })),
  ]
  const ratingItems = [
    { value: ALL_OPTIONS.rating, label: 'Any rating' },
    ...[1, 2, 3, 4, 5].map((r) => ({ value: String(r), label: `${r}+ star${r > 1 ? 's' : ''}` })),
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">All Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, filter, and manage every submission.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-2.5 p-4">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search comments or suggestions…"
              value={search}
              onChange={(e) => {
                beginRefetch()
                setSearch(e.target.value)
              }}
              className="bg-background pl-8"
            />
          </div>

          <Select
            items={categoryItems}
            value={category || ALL_OPTIONS.category}
            onValueChange={(v) => {
              beginRefetch()
              setCategory(v === ALL_OPTIONS.category ? '' : v)
            }}
          >
            <SelectTrigger className="w-40 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={statusItems}
            value={status || ALL_OPTIONS.status}
            onValueChange={(v) => {
              beginRefetch()
              setStatus(v === ALL_OPTIONS.status ? '' : v)
            }}
          >
            <SelectTrigger className="w-36 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={ratingItems}
            value={minRating || ALL_OPTIONS.rating}
            onValueChange={(v) => {
              beginRefetch()
              setMinRating(v === ALL_OPTIONS.rating ? '' : v)
            }}
          >
            <SelectTrigger className="w-32 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ratingItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select items={SORT_ITEMS} value={sort} onValueChange={(v) => {
            beginRefetch()
            setSort(v)
          }}>
            <SelectTrigger className="w-36 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <button
              type="button"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={handleReset}
            >
              Clear filters
            </button>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : feedback.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <span className="inline-grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="size-7" />
          </span>
          <h2 className="text-lg font-semibold">
            {hasFilters ? 'No matching feedback' : 'No feedback yet'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasFilters ? 'Try adjusting your search or filters.' : 'Submissions will appear here.'}
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Comment</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="max-w-80">
                      <span className="block truncate">{item.comment}</span>
                    </TableCell>
                    <TableCell>{item.userId?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {item.categoryId?.name || 'General'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RatingStars value={item.rating} readOnly size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <SentimentBadge sentiment={item.aiSentiment} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/feedback/${item._id}`}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
