import mongoose from 'mongoose'
import Feedback from '../models/Feedback.js'
import Category from '../models/Category.js'

const serializeDate = (rows) => rows.map((row) => ({ _id: row._id, count: row.count, avg: row.avg }))

export const getOverview = async (req, res, next) => {
  try {
    const [total, avgResult, byRating, byStatus, byCategory, byDay, recent] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Feedback.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Feedback.aggregate([
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Feedback.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Feedback.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate([
          { path: 'userId', select: 'name email' },
          { path: 'categoryId', select: 'name' },
        ]),
    ])

    const categories = await Category.find({ isActive: true }).lean()

    const ratingMap = Object.fromEntries(byRating.map((r) => [String(r._id), r.count]))
    const ratingDistribution = [1, 2, 3, 4, 5].map((value) => ({
      value,
      count: ratingMap[value] || 0,
    }))

    const categoryById = new Map(categories.map((c) => [String(c._id), c.name]))
    const byCategoryLabeled = byCategory.map((c) => ({
      name: categoryById.get(String(c._id)) || 'Unknown',
      count: c.count,
    }))

    const statusMap = Object.fromEntries(byStatus.map((s) => [String(s._id), s.count]))

    res.json({
      total,
      averageRating: avgResult[0] ? Math.round(avgResult[0].avg * 10) / 10 : 0,
      ratingDistribution,
      statusCounts: {
        new: statusMap.new || 0,
        reviewed: statusMap.reviewed || 0,
        resolved: statusMap.resolved || 0,
      },
      byCategory: byCategoryLabeled,
      byDay: serializeDate(byDay),
      recent,
    })
  } catch (error) {
    next(error)
  }
}

export const getReports = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query

    const filter = {}
    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({ message: 'Invalid category filter' })
      }
      filter.categoryId = new mongoose.Types.ObjectId(category)
    }
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(`${startDate}T00:00:00`)
      if (endDate) {
        filter.createdAt.$lt = new Date(new Date(`${endDate}T00:00:00`).getTime() + 86400000)
      }
    }

    const [byRating, byCategory, byDay] = await Promise.all([
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$rating', count: { $sum: 1 }, avgCommentLen: { $avg: { $strLenCP: '$comment' } } } },
        { $sort: { _id: 1 } },
      ]),
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: '$categoryId', count: { $sum: 1 }, avg: { $avg: '$rating' } } },
        { $sort: { count: -1 } },
      ]),
      Feedback.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            avg: { $avg: '$rating' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    const categories = await Category.find().lean()
    const categoryById = new Map(categories.map((c) => [String(c._id), c.name]))

    const ratingMap = Object.fromEntries(byRating.map((r) => [String(r._id), r]))
    const ratingDistribution = [1, 2, 3, 4, 5].map((value) => {
      const row = ratingMap[value]
      return {
        value,
        count: row ? row.count : 0,
        avgCommentLen: row ? Math.round(row.avgCommentLen) : 0,
      }
    })

    const byCategoryLabeled = byCategory.map((c) => ({
      name: categoryById.get(String(c._id)) || 'Unknown',
      count: c.count,
      averageRating: Math.round(c.avg * 10) / 10,
    }))

    const lowRated = byCategoryLabeled.filter((c) => c.averageRating <= 2.5)

    res.json({
      ratingDistribution,
      byCategory: byCategoryLabeled,
      byDay: serializeDate(byDay),
      lowRated,
    })
  } catch (error) {
    next(error)
  }
}
