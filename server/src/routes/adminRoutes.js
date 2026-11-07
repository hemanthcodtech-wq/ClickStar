import express from 'express';
import { 
  getAdminStats, 
  getAdminPosts, 
  toggleFlagPost, 
  adminDeletePost, 
  getAdminUsers,
  updateAdminUser,
  getAdminMonthlyLeaderboard 
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/posts', getAdminPosts);
router.patch('/posts/:id/flag', toggleFlagPost);
router.delete('/posts/:id', adminDeletePost);
router.get('/users', getAdminUsers);
router.patch('/users/:id', updateAdminUser);
router.get('/leaderboard/monthly', getAdminMonthlyLeaderboard);

export default router;

