import express from 'express';
import { searchGlobal } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', searchGlobal);

export default router;

