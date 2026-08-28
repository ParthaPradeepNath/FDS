import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { bulkUpdateFeedbackStatus } from '../api/client'
import RatingStars from './RatingStars'
import SentimentBadge from './SentimentBadge'
import { Badge } from './reui/badge'
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from './reui/kanban'
import { Card, CardContent, CardHeader } from './ui/card'
import { cn } from '@/lib/utils'

const STATUS_META = {
  new: { label: 'New', dot: 'bg-blue-500' },
  reviewed: { label: 'Reviewed', dot: 'bg-amber-500' },
  resolved: { label: 'Resolved', dot: 'bg-emerald-500' },
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

function groupByStatus(items) {
  const map = { new: [], reviewed: [], resolved: [] }
  for (const item of items) {
    const key = map[item.status] ? item.status : 'new'
    map[key].push(item)
  }
  return map
}

function FeedbackCard({ item, asHandle, isOverlay, disabled }) {
  const cardContent = (
    <Card size="sm" className="h-full transition-colors hover:border-foreground/25">
      <CardContent className="flex h-full flex-col gap-2.5">
        <Link
          to={`/feedback/${item._id}`}
          className="group/comment rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="line-clamp-3 text-[13px] leading-snug font-medium decoration-border underline-offset-4 group-hover/comment:underline">
            {item.comment}
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" size="sm">
            {item.categoryId?.name || 'General'}
          </Badge>
          {item.aiSentiment && <SentimentBadge sentiment={item.aiSentiment} />}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {item.userId?.name || 'Unknown'}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <RatingStars value={item.rating} readOnly size="xs" />
            <time className="text-[10px] whitespace-nowrap tabular-nums text-muted-foreground">
              {formatDate(item.createdAt)}
            </time>
          </span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <KanbanItem value={item._id} disabled={disabled}>
      {asHandle && !isOverlay ? (
        <KanbanItemHandle className="rounded-xl">{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  )
}

function FeedbackColumn({ value, items, isOverlay, disabled }) {
  const meta = STATUS_META[value]
  return (
    <KanbanColumn value={value} disabled={disabled}>
      <Card size="sm" className="gap-2 bg-muted/30">
        <CardHeader className="[.border-b]:pb-0">
          <div className="flex items-center gap-2">
            <span className={cn('size-2 rounded-full', meta.dot)} />
            <span className="text-sm font-semibold">{meta.label}</span>
            <Badge variant="outline" size="sm">
              {items.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-1.5">
          <KanbanColumnContent value={value} className="flex min-h-[10rem] flex-col gap-2 p-0.5">
            {items.length === 0 ? (
              <div className="grid min-h-24 place-items-center rounded-lg border border-dashed border-border/70 px-3 py-6 text-center">
                <span className="text-xs text-muted-foreground/70">
                  {isOverlay ? 'Drop feedback here' : 'No feedback yet'}
                </span>
              </div>
            ) : (
              items.map((item) => (
                <FeedbackCard
                  key={item._id}
                  item={item}
                  asHandle={!isOverlay}
                  isOverlay={isOverlay}
                  disabled={disabled}
                />
              ))
            )}
          </KanbanColumnContent>
        </CardContent>
      </Card>
    </KanbanColumn>
  )
}

export default function FeedbackBoard({ items, onRefetch }) {
  const [columns, setColumns] = useState(() => groupByStatus(items))
  const [busy, setBusy] = useState(false)

  const handleCommit = (_next, meta) => {
    if (meta.kind !== 'item' || meta.activeContainer === meta.overContainer) return
    const id = String(meta.event.active.id)
    const nextStatus = meta.overContainer
    setBusy(true)
    bulkUpdateFeedbackStatus([id], nextStatus)
      .then(({ data }) => {
        toast.success(
          `Marked ${data.updated} feedback item${data.updated === 1 ? '' : 's'} as ${
            STATUS_META[nextStatus].label.toLowerCase()
          }`,
        )
        onRefetch()
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not update feedback')
        setColumns(meta.previousValue)
      })
      .finally(() => setBusy(false))
  }

  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item._id}
      onValueCommit={handleCommit}
    >
      <div className="-mx-2 overflow-x-auto px-2 pb-2">
        <KanbanBoard className="grid auto-rows-fr min-w-[56rem] grid-cols-3 gap-4">
          {Object.entries(columns).map(([columnValue, columnItems]) => (
            <FeedbackColumn
              key={columnValue}
              value={columnValue}
              items={columnItems}
              isOverlay={false}
              disabled={busy}
            />
          ))}
        </KanbanBoard>
      </div>
      <KanbanOverlay>
        {({ value, variant }) => {
          if (variant === 'column') return null
          const item = Object.values(columns)
            .flat()
            .find((f) => f._id === value)
          if (!item) return null
          return (
            <div className="w-72">
              <FeedbackCard item={item} isOverlay />
            </div>
          )
        }}
      </KanbanOverlay>
    </Kanban>
  )
}