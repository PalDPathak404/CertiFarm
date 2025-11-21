const express = require('express');
const router = express.Router();
const {
  issueCredential,
  verifyCredentialById,
  getCredentialByBatch,
  revokeCredential,
  getCredentials,
  downloadQRCode
} = require('../controllers/credentialController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public verification route (no auth required)
router.get('/verify/:credentialId', verifyCredentialById);

// Protected routes
router.use(protect);

// Get all credentials
router.get('/', getCredentials);

// Issue credential
router.post('/issue/:batchId', authorize('qa_agency', 'admin'), issueCredential);

// Get credential by batch
router.get('/batch/:batchId', getCredentialByBatch);

// Get QR code
router.get('/:id/qr', downloadQRCode);

// Revoke credential
router.put('/:id/revoke', authorize('qa_agency', 'admin'), revokeCredential);

module.exports = router;