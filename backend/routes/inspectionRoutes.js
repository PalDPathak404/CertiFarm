const express = require('express');
const router = express.Router();
const {
  startInspection,
  submitInspection,
  getInspectionById,
  getPendingInspections,
  getInspections
} = require('../controllers/inspectionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// QA Agency routes
router.get('/pending', authorize('qa_agency', 'admin'), getPendingInspections);
router.post('/start/:batchId', authorize('qa_agency', 'admin'), startInspection);

// General routes
router.route('/')
  .get(getInspections);

router.route('/:id')
  .get(getInspectionById)
  .put(authorize('qa_agency', 'admin'), submitInspection);

module.exports = router;