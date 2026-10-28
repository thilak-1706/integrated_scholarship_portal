const express = require('express');
const router = express.Router();
const {
  login,
  registerStudent,
  registerInstituteOfficer,
  registerDepartmentOfficer,
  registerAdmin,
  getMe,
  updateProfile,
  getPublicInstitutions,
  getPublicDepartments
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Universal Login
router.post('/login', login);

// Registrations for all roles
router.post('/register', registerStudent);
router.post('/register-student', registerStudent);
router.post('/register/student', registerStudent);

router.post('/register-institute', registerInstituteOfficer);
router.post('/register/institute', registerInstituteOfficer);

router.post('/register-department', registerDepartmentOfficer);
router.post('/register/department', registerDepartmentOfficer);

router.post('/register-admin', registerAdmin);
router.post('/register/admin', registerAdmin);

// Public Metadata Endpoints for Registration & Browsing
router.get('/institutions', getPublicInstitutions);
router.get('/departments', getPublicDepartments);

// Profile
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
