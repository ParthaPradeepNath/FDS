import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarDays, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const pad = (n) => String(n).padStart(2, '0')
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const toDate = (value) => (value ? new Date(`${value}T00:00:00`) : undefined)
const formatDisplay = (value) =>
  value
    ? toDate(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

export default function DatePicker({ value, onChange, placeholder = 'Pick a date', className }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                'h-9 w-full justify-start gap-2 bg-background font-normal',
                !value && 'text-muted-foreground',
                value && 'pr-8',
              )}
            >
              <CalendarDays className="size-4" />
              {value ? formatDisplay(value) : placeholder}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={toDate(value)}
            onSelect={(d) => {
              onChange(d ? toISODate(d) : '')
              setOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear date"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
