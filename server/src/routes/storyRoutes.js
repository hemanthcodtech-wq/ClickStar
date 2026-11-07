import express from 'express';
import { upload } from '../config/cloudinary.js';
import { getActiveStories, createStory, viewStory } from '../controllers/storyController.js';

const router = express.Router();

router.get('/', getActiveStories);
router.post('/', upload.single('media'), createStory);
router.post('/:storyId/view', viewStory);

export default router;

