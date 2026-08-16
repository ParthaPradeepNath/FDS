import { useState } from 'react'
import { toast } from 'sonner'
import { analyzeFeedback } from '../api/client'
import SentimentBadge from './SentimentBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoaderCircle, RefreshCw, Sparkles, Wand2 } from 'lucide-react'

export default function AiInsightsCard({ feedback, canAnalyze, onAnalyzed }) {
  const [loading, setLoading] = useState(false)

  const analyzed = Boolean(feedback.aiSummary || feedback.aiSentiment)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const { data } = await analyzeFeedback(feedback._id)
      onAnalyzed?.(data.feedback)
      toast.success('AI analysis complete')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI insights
          </CardTitle>
          <CardDescription>Auto-generated sentiment, topics, and summary.</CardDescription>
        </div>
        {canAnalyze && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={handleAnalyze}
            className="gap-1.5"
          >
            {loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw className="size-3.5" />}
            {analyzed ? 'Re-analyze' : 'Analyze'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading && !analyzed ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
            <LoaderCircle className="animate-spin" />
            Analyzing comment…
          </div>
        ) : !analyzed ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
            <Wand2 className="size-5 shrink-0" />
            {canAnalyze
              ? 'Run analysis to extract sentiment, topics, and a short summary.'
              : 'AI analysis has not been run for this feedback yet.'}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Sentiment
              </span>
              <SentimentBadge sentiment={feedback.aiSentiment} />
            </div>
            {feedback.aiTopics?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Topics
                </span>
                {feedback.aiTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize"
                  >
                    {topic.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Summary
              </span>
              <p className="rounded-r-lg border-l-2 border-primary bg-muted/60 px-4 py-3 text-sm leading-relaxed">
                {feedback.aiSummary}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
