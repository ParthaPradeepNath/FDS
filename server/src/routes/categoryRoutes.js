import { Router } from 'express'
import Category from '../models/Category.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 })
    res.json({ categories })
  } catch (error) {
    next(error)
  }
})

export default router
