import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-7',
}

export default function RatingStars({ value, onChange, readOnly = false, size = 'md' }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', readOnly && 'pointer-events-none')}
      aria-label={`Rating: ${value} of 5`}
    >
      {stars.map((star) => {
        const filled = star <= value
        const icon = (
          <Star
            className={cn(
              SIZES[size],
              filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
            )}
          />
        )

        if (readOnly) {
          return <span key={star}>{icon}</span>
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${star} star`}
            className="cursor-pointer rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {icon}
          </button>
        )
      })}
    </div>
  )
}
