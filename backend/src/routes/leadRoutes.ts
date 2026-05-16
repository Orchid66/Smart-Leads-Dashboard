import { Router } from 'express'
import {
  getLeads,
  getStats,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportCSV,
} from '../controllers/leadController'
import { protect } from '../middleware/authMiddleware'

const router = Router()

// All lead routes require authentication
router.use(protect)

router.get('/stats', getStats)
router.get('/export', exportCSV)

router.route('/').get(getLeads).post(createLead)
router.route('/:id').get(getLead).put(updateLead).delete(deleteLead)

export default router
