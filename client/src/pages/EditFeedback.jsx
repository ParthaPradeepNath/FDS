import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import RatingStars from '../components/RatingStars'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/stateful-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EditFeedback() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ categoryId: '', rating: 0, comment: '', suggestion: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([api.get('/categories'), api.get(`/feedback/${id}`)])
      .then(([catRes, fbRes]) => {
        if (cancelled) return
        setCategories(catRes.data.categories)
        const fb = fbRes.data.feedback
        setForm({
          categoryId: fb.categoryId?._id || '',
          rating: fb.rating,
          comment: fb.comment,
          suggestion: fb.suggestion || '',
        })
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load feedback'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.rating) {
      setError('Please select a rating.')
      return
    }

    try {
      const { data } = await api.put(`/feedback/${id}`, form)
      navigate(`/feedback/${data.feedback._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feedback')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
        </div>
        <Card>
          <CardContent className="flex flex-col gap-5 p-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={`/feedback/${id}`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mb-4 -ml-2 gap-1.5 text-muted-foreground')}
      >
        <ArrowLeft />
        Back to details
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Edit feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update the details of your submission.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feedback details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Rating</Label>
              <RatingStars
                value={form.rating}
                onChange={(rating) => setForm((f) => ({ ...f, rating }))}
                size="lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                name="comment"
                rows={5}
                maxLength={2000}
                value={form.comment}
                onChange={handleChange}
                className="resize-y bg-background"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="suggestion">Suggestion</Label>
              <Textarea
                id="suggestion"
                name="suggestion"
                rows={3}
                maxLength={2000}
                value={form.suggestion}
                onChange={handleChange}
                className="resize-y bg-background"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Link to={`/feedback/${id}`} className={buttonVariants({ variant: 'outline' })}>
                Cancel
              </Link>
              <Button
                type="submit"
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground hover:ring-primary"
              >
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
