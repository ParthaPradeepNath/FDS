import { Router } from 'express'
import {
  createFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  analyzeFeedbackById,
  analyzeFeedbackBatch,
  bulkUpdateFeedback,
} from '../controllers/feedbackController.js'
import { protect } from '../middleware/auth.js'
import { isAdmin } from '../middleware/authorize.js'

const router = Router()

router.use(protect)

router.post('/bulk', isAdmin, bulkUpdateFeedback)
router.post('/analyze', isAdmin, analyzeFeedbackBatch)
router.post('/:id/analyze', analyzeFeedbackById)
router.route('/').post(createFeedback).get(getFeedback)
router.route('/:id').get(getFeedbackById).put(updateFeedback).delete(deleteFeedback)

export default router
