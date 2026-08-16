import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import RatingStars from '../components/RatingStars'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowUpRight, Inbox, LoaderCircle, PencilLine, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function MyFeedback() {
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const loading = feedback === null && !error

  useEffect(() => {
    let active = true
    api
      .get('/feedback', { params: { sort: 'newest' } })
      .then(({ data }) => {
        if (active) setFeedback(data.feedback)
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load feedback')
      })
    return () => {
      active = false
    }
  }, [])

  const handleDelete = async () => {
    setDeleting(confirmId)
    try {
      await api.delete(`/feedback/${confirmId}`)
      setFeedback((list) => list.filter((item) => item._id !== confirmId))
      toast.success('Feedback deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete feedback')
    } finally {
      setDeleting(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Feedback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every submission you've made, newest first.
          </p>
        </div>
        <Link to="/feedback/new" className={buttonVariants()}>
          <Plus />
          New feedback
        </Link>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : feedback.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <span className="inline-grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-7" />
          </span>
          <h2 className="text-lg font-semibold">No feedback yet</h2>
          <p className="text-sm text-muted-foreground">Your submitted feedback will appear here.</p>
          <Link to="/feedback/new" className={buttonVariants()}>
            Submit your first feedback
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {feedback.map((item) => (
            <Card key={item._id} className="hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {item.categoryId?.name || 'General'}
                    </span>
                    <RatingStars value={item.rating} readOnly size="sm" />
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                </div>

                <p className="text-sm leading-relaxed">{item.comment}</p>

                {item.suggestion && (
                  <p className="rounded-r-lg border-l-2 border-primary bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Suggestion:</span> {item.suggestion}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/feedback/${item._id}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
                  >
                    View details
                    <ArrowUpRight />
                  </Link>
                  <Link
                    to={`/feedback/${item._id}/edit`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
                  >
                    <PencilLine />
                    Edit
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleting === item._id}
                    onClick={() => setConfirmId(item._id)}
                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {deleting === item._id ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmId)}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this feedback?"
        description="This will permanently remove the feedback. This action cannot be undone."
        busy={Boolean(deleting)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
