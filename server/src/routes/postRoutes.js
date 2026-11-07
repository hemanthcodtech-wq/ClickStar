import express from 'express';
import { upload } from '../config/cloudinary.js';
import { 
  getPosts, 
  createPost, 
  searchHashtags,
  toggleLike, 
  toggleSave,
  toggleFollow,
  getComments, 
  addComment, 
  deletePost 
} from '../controllers/postController.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/hashtags/suggest', searchHashtags);
router.post('/', upload.single('image'), createPost);
router.delete('/:id', deletePost);

// Social interactions
router.post('/:id/like', toggleLike);
router.post('/:id/save', toggleSave);
router.post('/follow/:targetUserId', toggleFollow);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);

export default router;
