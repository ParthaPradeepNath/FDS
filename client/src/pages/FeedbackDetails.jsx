import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import RatingStars from '../components/RatingStars'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../context/useAuth.js'
import AiInsightsCard from '../components/AiInsightsCard'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft, LoaderCircle, PencilLine, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_OPTIONS } from '@/lib/constants'

export default function FeedbackDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()

  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    api
      .get(`/feedback/${id}`)
      .then(({ data }) => setFeedback(data.feedback))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load feedback'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status) => {
    setSavingStatus(true)
    try {
      const { data } = await api.put(`/feedback/${id}`, { status })
      setFeedback(data.feedback)
      toast.success(`Marked as ${status.charAt(0).toUpperCase() + status.slice(1)}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/feedback/${id}`)
      toast.success('Feedback deleted')
      navigate('/my-feedback')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete feedback')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-40" />
        </div>
        <Card>
          <CardContent className="flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          Back home
        </Link>
      </div>
    )
  }

  const canEdit = !isAdmin && feedback.userId?._id === user?.id

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={isAdmin ? '/admin/feedback' : '/my-feedback'}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mb-4 -ml-2 gap-1.5 text-muted-foreground')}
      >
        <ArrowLeft />
        Back to {isAdmin ? 'all feedback' : 'my feedback'}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Feedback details</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <RatingStars value={feedback.rating} readOnly size="lg" />
              <span className="text-2xl font-bold">{feedback.rating}.0</span>
            </div>
            <StatusBadge status={feedback.status} />
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border bg-muted/40 p-4 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Category</span>
              <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {feedback.categoryId?.name || 'General'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Submitted by</span>
              <span className="text-sm font-medium">
                {isAdmin ? feedback.userId?.name || 'Unknown' : 'You'}
                {isAdmin && feedback.userId?.email && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({feedback.userId.email})
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Submitted</span>
              <span className="text-sm font-medium">
                {new Date(feedback.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {feedback.updatedAt !== feedback.createdAt && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Last updated</span>
                <span className="text-sm font-medium">
                  {new Date(feedback.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Comment
            </h3>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{feedback.comment}</p>
          </div>

          <AiInsightsCard
            feedback={feedback}
            canAnalyze={isAdmin || canEdit}
            onAnalyzed={setFeedback}
          />

          {feedback.suggestion && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Suggestion
              </h3>
              <p className="rounded-r-lg border-l-2 border-primary bg-muted/60 px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
                {feedback.suggestion}
              </p>
            </div>
          )}

          {isAdmin && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Review status
              </h3>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={feedback.status === option.value ? 'default' : 'outline'}
                    disabled={savingStatus}
                    onClick={() => handleStatusChange(option.value)}
                    className={cn(
                      feedback.status === option.value && 'bg-primary text-primary-foreground',
                    )}
                  >
                    {savingStatus && feedback.status === option.value ? (
                      <LoaderCircle className="animate-spin" />
                    ) : null}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {canEdit && (
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Link
                to={`/feedback/${feedback._id}/edit`}
                className={cn(buttonVariants(), 'gap-1.5')}
              >
                <PencilLine />
                Edit feedback
              </Link>
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setConfirmOpen(true)}
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 />
                Delete feedback
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this feedback?"
        description="This will permanently remove the feedback. This action cannot be undone."
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
