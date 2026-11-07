import express from 'express';
import { upload } from '../config/cloudinary.js';
import { 
  getUserProfile, 
  getAllUsers, 
  updateProfile,
  getFollowRequests,
  acceptFollowRequest,
  declineFollowRequest
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:username', getUserProfile);
router.patch('/profile', upload.single('avatar'), updateProfile);

// Follow requests management
router.get('/requests/:userId', getFollowRequests);
router.post('/requests/:requestId/accept', acceptFollowRequest);
router.post('/requests/:requestId/decline', declineFollowRequest);

export default router;

