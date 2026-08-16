import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/client'
import RatingStars from '../components/RatingStars'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/stateful-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FeedbackForm() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    categoryId: '',
    rating: 0,
    comment: '',
    suggestion: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => {
        setCategories(data.categories)
        if (data.categories.length > 0) {
          setForm((f) => ({ ...f, categoryId: data.categories[0]._id }))
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.rating) {
      setError('Please select a rating before submitting.')
      return
    }

    try {
      const { data } = await api.post('/feedback', form)
      setSuccess(data.feedback)
      toast.success('Feedback submitted', { description: 'Thanks for sharing your experience.' })
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="inline-grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">Thank you for your feedback!</h1>
            <p className="text-sm text-muted-foreground">
              Your feedback has been recorded and is now visible in{' '}
              <Link to="/my-feedback" className="font-medium text-primary underline-offset-4 hover:underline">
                My Feedback
              </Link>
              .
            </p>
            <div className="mt-1 flex items-center gap-3">
              <RatingStars value={success.rating} readOnly size="sm" />
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                New
              </span>
            </div>
            <p className="max-w-sm rounded-lg bg-muted px-4 py-3 text-sm italic text-muted-foreground">
              “{success.comment}”
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(null)
                  setForm({ categoryId: categories[0]?._id || '', rating: 0, comment: '', suggestion: '' })
                }}
              >
                Submit another
              </Button>
              <Link to="/my-feedback" className={buttonVariants()}>
                View my feedback
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Give Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We value your input. Tell us what worked and what could be better.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Share your experience</CardTitle>
          <CardDescription>All fields marked as required help us act faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              {loading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  items={categories.map((c) => ({ value: c._id, label: c.name }))}
                  value={form.categoryId || undefined}
                  onValueChange={(categoryId) => setForm((f) => ({ ...f, categoryId }))}
                >
                  <SelectTrigger id="category" className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Overall rating</Label>
              <RatingStars
                value={form.rating}
                onChange={(rating) => setForm((f) => ({ ...f, rating }))}
                size="lg"
              />
              {form.rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  You selected {form.rating} {form.rating === 1 ? 'star' : 'stars'}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="comment">Comment</Label>
                <span className="text-xs text-muted-foreground">{form.comment.length}/2000</span>
              </div>
              <Textarea
                id="comment"
                name="comment"
                rows={5}
                maxLength={2000}
                value={form.comment}
                onChange={handleChange}
                placeholder="Share the details of your experience…"
                className="resize-y bg-background"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="suggestion">
                Suggestion <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="suggestion"
                name="suggestion"
                rows={3}
                maxLength={2000}
                value={form.suggestion}
                onChange={handleChange}
                placeholder="How can we improve?"
                className="resize-y bg-background"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                onClick={handleSubmit}
                className={cn('h-10 px-6 bg-primary text-primary-foreground hover:ring-primary')}
              >
                Submit feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
