import { Router } from 'express'
import { getOverview, getReports } from '../controllers/reportController.js'
import { protect } from '../middleware/auth.js'
import { isAdmin } from '../middleware/authorize.js'

const router = Router()

router.use(protect, isAdmin)

router.get('/overview', getOverview)
router.get('/', getReports)

export default router
