import { Badge } from '@/components/ui/badge'
import { Minus, ThumbsDown, ThumbsUp } from 'lucide-react'

const SENTIMENT = {
  positive: {
    label: 'Positive',
    className:
      'border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300',
    Icon: ThumbsUp,
  },
  negative: {
    label: 'Negative',
    className:
      'border-transparent bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-300',
    Icon: ThumbsDown,
  },
  neutral: {
    label: 'Neutral',
    className: 'border-transparent bg-muted text-muted-foreground',
    Icon: Minus,
  },
}

export default function SentimentBadge({ sentiment }) {
  const config = SENTIMENT[sentiment]
  if (!config) return null
  const { Icon } = config
  return (
    <Badge variant="secondary" className={`gap-1 ${config.className}`}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}
