import express from 'express';
import { 
  getUserNotifications, 
  markNotificationsAsRead, 
  acceptFollowRequest 
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:userId', getUserNotifications);
router.patch('/:userId/read', markNotificationsAsRead);
router.post('/:userId/accept-follow', acceptFollowRequest);

export default router;

