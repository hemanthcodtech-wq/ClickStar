import express from 'express';
import {
  checkUsername,
  initiateSignup,
  verifySignup,
  login,
  forgotPassword,
  resetPassword,
  googleAuth,
} from '../controllers/authController.js';

const router = express.Router();

router.get('/check-username', checkUsername);
router.post('/signup/initiate', initiateSignup);
router.post('/signup/verify', verifySignup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

export default router;

