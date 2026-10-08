const express = require('express');
const router = express.Router();
const {
  getEmailLogs,
  retryEmailDispatch,
  downloadSanctionPdf
} = require('../controllers/emailController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public or Student/Officer download PDF (authenticated)
router.get('/sanctions/:id/pdf', protect, downloadSanctionPdf);

// Admin-only monitoring and retry routes
router.get('/logs', protect, authorizeRoles('ADMIN', 'SUPER_ADMIN'), getEmailLogs);
router.post('/logs/:id/retry', protect, authorizeRoles('ADMIN', 'SUPER_ADMIN'), retryEmailDispatch);

module.exports = router;
