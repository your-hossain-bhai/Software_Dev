const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getStats,
} = require('../controllers/admin.controller');

// All routes require authentication + admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Stats
router.get('/stats', getStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
