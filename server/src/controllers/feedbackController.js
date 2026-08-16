import Feedback from '../models/Feedback.js'
import Category from '../models/Category.js'
import { analyzeFeedback, isAiConfigured } from '../services/ai.js'

const populateOptions = [
  { path: 'userId', select: 'name email role' },
  { path: 'categoryId', select: 'name' },
]

const persistAiAnalysis = async (feedbackId, ai) => {
  await Feedback.updateOne(
    { _id: feedbackId },
    {
      $set: {
        aiSentiment: ai.sentiment,
        aiTopics: ai.topics,
        aiSummary: ai.summary,
        aiUpdatedAt: new Date(),
      },
    },
  )
}

const enrich = async (feedbackId, { comment, rating, suggestion }) => {
  try {
    const ai = await analyzeFeedback({ comment, rating, suggestion })
    await persistAiAnalysis(feedbackId, ai)
  } catch (error) {
    console.error(`[ai] enrichment failed for ${feedbackId}: ${error.detail || error.message}`)
  }
}

export const createFeedback = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot submit feedback' })
    }

    const { categoryId, rating, comment, suggestion } = req.body

    if (!categoryId) return res.status(400).json({ message: 'Category is required' })
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' })
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' })
    }

    const category = await Category.findById(categoryId)
    if (!category) return res.status(400).json({ message: 'Selected category does not exist' })
    if (!category.isActive) {
      return res.status(400).json({ message: 'Selected category is not available' })
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      categoryId,
      rating,
      comment,
      suggestion: suggestion || '',
    })

    await feedback.populate(populateOptions)
    enrich(feedback._id, { comment, rating, suggestion })
    res.status(201).json({ feedback })
  } catch (error) {
    next(error)
  }
}

export const getFeedback = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin'
    const { category, status, minRating, maxRating, startDate, endDate, search, sort } = req.query

    const filter = {}
    if (!isAdmin) filter.userId = req.user._id

    if (category) filter.categoryId = category
    if (status) {
      const validStatuses = ['new', 'reviewed', 'resolved']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' })
      }
      filter.status = status
    }
    if (minRating || maxRating) {
      filter.rating = {}
      if (minRating) filter.rating.$gte = Number(minRating)
      if (maxRating) filter.rating.$lte = Number(maxRating)
    }
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(`${startDate}T00:00:00`)
      if (endDate) {
        filter.createdAt.$lt = new Date(new Date(`${endDate}T00:00:00`).getTime() + 86400000)
      }
    }
    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { suggestion: { $regex: search, $options: 'i' } },
      ]
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'rating-desc': { rating: -1, createdAt: -1 },
      'rating-asc': { rating: 1, createdAt: -1 },
    }
    const sortBy = sortOptions[sort] || sortOptions.newest

    const feedback = await Feedback.find(filter)
      .sort(sortBy)
      .populate(populateOptions)

    res.json({ feedback })
  } catch (error) {
    next(error)
  }
}

export const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate(populateOptions)

    if (!feedback) return res.status(404).json({ message: 'Feedback not found' })

    const isAdmin = req.user.role === 'admin'
    if (!isAdmin && !feedback.userId._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'You do not have permission to view this feedback' })
    }

    res.json({ feedback })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' })
    }
    next(error)
  }
}

export const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)

    if (!feedback) return res.status(404).json({ message: 'Feedback not found' })

    if (req.user.role === 'admin') {
      const { categoryId, rating, comment, suggestion, status } = req.body

      if (
        categoryId !== undefined ||
        rating !== undefined ||
        comment !== undefined ||
        suggestion !== undefined
      ) {
        return res.status(403).json({ message: 'Admins cannot edit feedback content' })
      }
      if (status === undefined) {
        return res.status(403).json({ message: 'Admins can only update the review status' })
      }
      if (!['new', 'reviewed', 'resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' })
      }

      feedback.status = status
      await feedback.save()
      await feedback.populate(populateOptions)
      return res.json({ feedback })
    }

    if (!feedback.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You do not have permission to edit this feedback' })
    }

    const { categoryId, rating, comment, suggestion } = req.body
    const updates = {}

    if (categoryId !== undefined) {
      const category = await Category.findById(categoryId)
      if (!category) return res.status(400).json({ message: 'Selected category does not exist' })
      updates.categoryId = categoryId
    }
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' })
      }
      updates.rating = rating
    }
    if (comment !== undefined) {
      if (!comment.trim()) return res.status(400).json({ message: 'Comment cannot be empty' })
      updates.comment = comment
    }
    if (suggestion !== undefined) updates.suggestion = suggestion

    Object.assign(feedback, updates)
    await feedback.save()
    await feedback.populate(populateOptions)

    res.json({ feedback })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' })
    }
    next(error)
  }
}

export const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)

    if (!feedback) return res.status(404).json({ message: 'Feedback not found' })

    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot delete feedback' })
    }

    if (!feedback.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You do not have permission to delete this feedback' })
    }

    await feedback.deleteOne()
    res.json({ message: 'Feedback deleted successfully' })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' })
    }
    next(error)
  }
}

export const analyzeFeedbackById = async (req, res, next) => {
  try {
    if (!isAiConfigured()) {
      return res.status(400).json({
        message:
          'No AI provider configured. Set an API key in server/.env (AI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY).',
      })
    }
    const feedback = await Feedback.findById(req.params.id)
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' })

    const isAdmin = req.user.role === 'admin'
    if (!isAdmin && !feedback.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You do not have permission to analyze this feedback' })
    }

    let ai
    try {
      ai = await analyzeFeedback({
        comment: feedback.comment,
        rating: feedback.rating,
        suggestion: feedback.suggestion,
      })
    } catch (error) {
      console.error(`[ai] analyze failed for ${feedback._id}: ${error.detail || error.message}`)
      return res
        .status(502)
        .json({ message: 'AI analysis is temporarily unavailable. Please try again in a few minutes.' })
    }
    await persistAiAnalysis(feedback._id, ai)

    const updated = await Feedback.findById(feedback._id).populate(populateOptions)
    res.json({ feedback: updated })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Feedback not found' })
    }
    next(error)
  }
}

export const analyzeFeedbackBatch = async (req, res, next) => {
  try {
    if (!isAiConfigured()) {
      return res.status(400).json({
        message:
          'No AI provider configured. Set an API key in server/.env (AI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY).',
      })
    }
    const force = req.query.force === 'true'

    const filter = force ? {} : { $or: [{ aiUpdatedAt: null }, { aiUpdatedAt: { $exists: false } }] }
    const items = await Feedback.find(filter)
      .select('_id comment rating suggestion')
      .lean()

    const analyzed = []
    const failed = []
    let cursor = 0
    const workers = Array.from({ length: 2 }, async () => {
      while (cursor < items.length) {
        const item = items[cursor++]
        try {
          const ai = await analyzeFeedback({
            comment: item.comment,
            rating: item.rating,
            suggestion: item.suggestion,
          })
          await persistAiAnalysis(item._id, ai)
          analyzed.push(item._id)
        } catch (error) {
          failed.push(item._id)
          console.error(`[ai] batch analyze failed for ${item._id}: ${error.detail || error.message}`)
        }
      }
    })
    await Promise.all(workers)

    res.json({
      analyzed: analyzed.length,
      failed: failed.length,
      total: items.length,
      message:
        failed.length > 0
          ? 'AI analysis is temporarily unavailable. Please try again in a few minutes.'
          : undefined,
    })
  } catch (error) {
    next(error)
  }
}
