import { useEffect, useMemo, useRef, useState, useDeferredValue } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import api, { bulkUpdateFeedbackStatus } from '../api/client'
import RatingStars from '../components/RatingStars'
import StatusBadge from '../components/StatusBadge'
import SentimentBadge from '../components/SentimentBadge'
import FeedbackBoard from '../components/FeedbackBoard'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Eye,
  Search,
  SearchX,
  SquareKanban,
  Table2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_OPTIONS } from '@/lib/constants'
import { tabSwitch } from '@/lib/motion'

const ALL_OPTIONS = {
  category: 'all-categories',
  status: 'all-statuses',
  rating: 'any-rating',
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

function SortableHeader({ column, label, active, direction, onSort, className }) {
  const Icon = active ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <th
      scope="col"
      aria-sort={
        active ? (direction === 'asc' ? 'ascending' : 'descending') : undefined
      }
      className={cn(
        'h-12 px-3 text-left font-medium whitespace-nowrap text-foreground/80',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-label={`Sort by ${label}${
          active ? `, currently ${direction === 'asc' ? 'ascending' : 'descending'}` : ''
        }`}
        className="group inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-inherit transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
        <Icon
          className={cn(
            'size-3.5 transition-colors',
            active
              ? 'text-foreground'
              : 'text-muted-foreground/40 group-hover:text-muted-foreground',
          )}
        />
      </button>
    </th>
  )
}

export default function FeedbackList() {
  const [feedback, setFeedback] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [minRating, setMinRating] = useState('')

  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const [selected, setSelected] = useState([])
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)

  const [view, setView] = useState('table')
  const [dataVersion, setDataVersion] = useState(0)

  const selectAllRef = useRef(null)

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
      sort: 'newest',
    }
    api
      .get('/feedback', { params })
      .then(({ data }) => {
        if (active) {
          setFeedback(data.feedback)
          setDataVersion((v) => v + 1)
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load feedback')
      })
    return () => {
      active = false
    }
  }, [deferredSearch, category, status, minRating, reload])

  const sorted = useMemo(() => {
    const arr = [...(feedback || [])]
    arr.sort((a, b) => {
      const av = sortKey === 'rating' ? a.rating : new Date(a.createdAt).getTime()
      const bv = sortKey === 'rating' ? b.rating : new Date(b.createdAt).getTime()
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return arr
  }, [feedback, sortKey, sortDir])

  const sortedIds = sorted.map((item) => item._id)
  const allSelected = sorted.length > 0 && sorted.every((item) => selected.includes(item._id))
  const someSelected = sorted.some((item) => selected.includes(item._id))

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected
    }
  }, [someSelected, allSelected])

  const beginRefetch = () => {
    setError('')
    setFeedback(null)
    setSelected([])
    setReload((r) => r + 1)
  }

  const softRefetch = () => setReload((r) => r + 1)

  const handleReset = () => {
    beginRefetch()
    setSearch('')
    setCategory('')
    setStatus('')
    setMinRating('')
    setSortKey('createdAt')
    setSortDir('desc')
    setSelected([])
  }

  const handleSort = (column) => {
    if (sortKey === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(column)
      setSortDir('desc')
    }
  }

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !sortedIds.includes(id)))
    } else {
      setSelected((prev) => [...new Set([...prev, ...sortedIds])])
    }
  }

  const markStatus = async (nextStatus) => {
    setBusy(true)
    try {
      const { data } = await bulkUpdateFeedbackStatus(selected, nextStatus)
      toast.success(
        `Marked ${data.updated} item${data.updated === 1 ? '' : 's'} as ${
          nextStatus === 'reviewed' ? 'reviewed' : 'resolved'
        }`,
      )
      setSelected([])
      beginRefetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update feedback')
    } finally {
      setBusy(false)
    }
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Feedback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and manage every submission.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
          <Button
            size="sm"
            variant={view === 'table' ? 'default' : 'ghost'}
            onClick={() => setView('table')}
            className="gap-1.5"
          >
            <Table2 className="size-4" />
            Table
          </Button>
          <Button
            size="sm"
            variant={view === 'board' ? 'default' : 'ghost'}
            onClick={() => setView('board')}
            className="gap-1.5"
          >
            <SquareKanban className="size-4" />
            Board
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <Card className="mb-6 shadow-sm">
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

          {hasFilters && (
            <button
              type="button"
              className="text-sm font-medium text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
              onClick={handleReset}
            >
              Clear filters
            </button>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-0"
                >
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="hidden h-4 w-16 sm:block" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center shadow-sm">
          <span className="inline-grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="size-7" />
          </span>
          <h2 className="text-lg font-semibold">
            {hasFilters ? 'No matching feedback' : 'No feedback yet'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasFilters ? 'Try adjusting your search or filters.' : 'Submissions will appear here.'}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" className="mt-1" onClick={handleReset}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            variants={tabSwitch}
            initial="initial"
            animate="animate"
            exit="exit"
            className="will-change-transform"
          >
            {view === 'board' ? (
              <FeedbackBoard key={dataVersion} items={sorted} onRefetch={softRefetch} />
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-0">
                  {selected.length > 0 && (
              <div
                data-bulk-bar
                className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 px-4 py-2"
              >
                <span className="mr-1 text-sm font-medium">
                  {selected.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => markStatus('reviewed')}
                >
                  <Check className="size-3.5" />
                  Mark reviewed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => markStatus('resolved')}
                >
                  <CheckCircle2 className="size-3.5" />
                  Mark resolved
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => setSelected([])}
                >
                  <X className="size-3.5" />
                  Clear
                </Button>
              </div>
            )}

            <div className="px-4 py-2">
              <Table containerClassName="overflow-visible" className="table-fixed">
              <colgroup>
                <col className="w-11" />
                <col className="w-[35%]" />
                <col className="hidden w-[12%] md:table-column" />
                <col className="hidden w-[10%] md:table-column" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="hidden w-[10%] lg:table-column" />
                <col className="hidden w-[12%] sm:table-column" />
                <col className="w-20" />
              </colgroup>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="h-12 w-11 pl-4 pr-0">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      disabled={busy}
                      onChange={toggleSelectAll}
                      aria-label="Select all rows"
                      className="size-4 cursor-pointer rounded border-border accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:outline-none"
                    />
                  </TableHead>
                  <TableHead scope="col" className="h-12 px-3 text-[13px] font-medium text-foreground/80">
                    Comment
                  </TableHead>
                  <TableHead scope="col" className="hidden h-12 px-3 text-[13px] font-medium text-foreground/80 md:table-cell">
                    User
                  </TableHead>
                  <TableHead scope="col" className="hidden h-12 px-3 text-[13px] font-medium text-foreground/80 md:table-cell">
                    Category
                  </TableHead>
                  <SortableHeader column="rating" label="Rating" active={sortKey === 'rating'} direction={sortDir} onSort={handleSort} />
                  <TableHead scope="col" className="h-12 px-3 text-[13px] font-medium text-foreground/80">
                    Status
                  </TableHead>
                  <TableHead scope="col" className="hidden h-12 px-3 text-[13px] font-medium text-foreground/80 lg:table-cell">
                    Sentiment
                  </TableHead>
                  <SortableHeader
                    column="createdAt"
                    label="Submitted"
                    active={sortKey === 'createdAt'}
                    direction={sortDir}
                    onSort={handleSort}
                    className="hidden sm:table-cell"
                  />
                  <TableHead scope="col" className="h-12 px-3 text-right text-[13px] font-medium text-foreground/80">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((item) => {
                  const isSelected = selected.includes(item._id)
                  return (
                    <TableRow
                      key={item._id}
                      className={cn('h-14', isSelected && 'bg-primary/5')}
                    >
                      <TableCell className="w-11 pl-4 pr-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={busy}
                          onChange={() => toggleSelected(item._id)}
                          aria-label={`Select feedback: ${item.comment}`}
                          className="size-4 cursor-pointer rounded border-border accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:outline-none"
                        />
                      </TableCell>
                      <TableCell className="px-3">
                        <Link
                          to={`/feedback/${item._id}`}
                          className="group/comment inline-flex w-full items-start gap-1.5 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          <span className="line-clamp-2 decoration-border underline-offset-4 group-hover/comment:underline">
                            {item.comment}
                          </span>
                          <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover/comment:text-primary" />
                        </Link>
                      </TableCell>
                      <TableCell className="hidden px-3 md:table-cell">
                        {item.userId?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="hidden px-3 md:table-cell">
                        <Badge
                          variant="secondary"
                          className="border-transparent bg-accent text-accent-foreground"
                        >
                          {item.categoryId?.name || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <RatingStars value={item.rating} readOnly size="xs" />
                      </TableCell>
                      <TableCell className="px-3">
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="hidden px-3 lg:table-cell">
                        {item.aiSentiment ? (
                          <SentimentBadge sentiment={item.aiSentiment} />
                        ) : (
                          <span className="text-foreground/80">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden px-3 text-foreground/80 sm:table-cell">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="px-3 text-right">
                        <Link
                          to={`/feedback/${item._id}`}
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'gap-1',
                          )}
                        >
                          <Eye className="size-3.5" />
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
