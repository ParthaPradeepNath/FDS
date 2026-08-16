import { Badge } from '@/components/ui/badge'

const STATUS = {
  new: { label: 'New', className: 'border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300' },
  reviewed: {
    label: 'Reviewed',
    className: 'border-transparent bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300',
  },
  resolved: {
    label: 'Resolved',
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300',
  },
}

export default function StatusBadge({ status }) {
  const config = STATUS[status] || {
    label: status,
    className: 'border-border bg-secondary text-secondary-foreground',
  }
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
