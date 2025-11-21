const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  addDocument,
  getBatchStats
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All routes require authentication
router.use(protect);

// Statistics route (must be before /:id to avoid conflict)
router.get('/stats', getBatchStats);

// CRUD routes
router.route('/')
  .get(getBatches)
  .post(authorize('exporter', 'admin'), createBatch);

router.route('/:id')
  .get(getBatchById)
  .put(authorize('exporter', 'admin'), updateBatch);

// Document upload
router.post('/:id/documents', 
  authorize('exporter', 'admin'),
  upload.single('document'),
  async (req, res, next) => {
    if (req.file) {
      req.body.url = `/uploads/${req.file.filename}`;
      req.body.name = req.file.originalname;
    }
    next();
  },
  addDocument
);

module.exports = router;