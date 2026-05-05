const User = require('../models/User');

/**
 * Get all users (Admin only)
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filter by role
    if (role && ['user', 'admin', 'super_admin'].includes(role)) {
      query.role = role;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch users.' });
  }
};

/**
 * Get single user by ID (Admin only)
 * GET /api/admin/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch user.' });
  }
};

/**
 * Update user role (Admin only, super_admin can change anyone, admin cannot change super_admin)
 * PATCH /api/admin/users/:id/role
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;
    
    // Validate role
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be user, admin, or super_admin.' });
    }
    
    // Get target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Prevent changing own role
    if (targetUserId === req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot change your own role.' });
    }
    
    // Only super_admin can:
    // - Change anyone to super_admin
    // - Change a super_admin to something else
    if (req.userRole !== 'super_admin') {
      if (role === 'super_admin') {
        return res.status(403).json({ message: 'Only super_admin can promote to super_admin.' });
      }
      if (targetUser.role === 'super_admin') {
        return res.status(403).json({ message: 'Only super_admin can demote another super_admin.' });
      }
    }
    
    // Update role
    targetUser.role = role;
    await targetUser.save();
    
    res.json({
      message: 'User role updated successfully.',
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update user role.' });
  }
};

/**
 * Delete user (Admin only, cannot delete super_admin unless you are super_admin)
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    // Get target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Prevent deleting own account
    if (targetUserId === req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot delete your own account.' });
    }
    
    // Only super_admin can delete another super_admin
    if (targetUser.role === 'super_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ message: 'Only super_admin can delete another super_admin.' });
    }
    
    await User.findByIdAndDelete(targetUserId);
    
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete user.' });
  }
};

/**
 * Get admin dashboard stats
 * GET /api/admin/stats
 */
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, adminCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);
    
    // Get role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    
    res.json({
      totalUsers,
      adminCount,
      recentUsers,
      roleDistribution: roleDistribution.reduce((acc, item) => {
        acc[item._id || 'user'] = item.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch stats.' });
  }
};
