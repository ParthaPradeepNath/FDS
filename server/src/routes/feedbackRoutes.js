import { Router } from 'express'
import {
  createFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedbackController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/').post(createFeedback).get(getFeedback)
router.route('/:id').get(getFeedbackById).put(updateFeedback).delete(deleteFeedback)

export default router
