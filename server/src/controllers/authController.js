import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../config/db.js';
import { 
  sendVerificationEmail, 
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedConfirmation 
} from '../config/mailer.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_clickstar';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Generate 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT token
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Check username availability
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Regex check (letters, numbers, underscores, 3-30 chars)
    const validPattern = /^[a-zA-Z0-9_]{3,30}$/;
    if (!validPattern.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Must be 3-30 characters (letters, numbers, underscore only)',
      });
    }

    const sql = getDb();
    const [existing] = await sql`
      SELECT id FROM users WHERE LOWER(username) = ${cleanUsername}
    `;

    if (existing) {
      return res.json({
        success: true,
        available: false,
        message: `@${cleanUsername} is already taken`,
      });
    }

    return res.json({
      success: true,
      available: true,
      message: `@${cleanUsername} is available! ✨`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 1. INITIATE SIGNUP (Sends OTP to email)
export const initiateSignup = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const sql = getDb();
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check existing verified user
    const [existing] = await sql`
      SELECT id, email, username, is_verified FROM users 
      WHERE email = ${cleanEmail} OR username = ${cleanUsername}
    `;

    if (existing && existing.is_verified) {
      return res.status(400).json({
        success: false,
        message: existing.email === cleanEmail ? 'Email is already registered' : 'Username is already taken',
      });
      
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending verification
    await sql`
      DELETE FROM verification_codes WHERE email = ${cleanEmail} AND type = 'signup'
    `;

    await sql`
      INSERT INTO verification_codes (email, code, type, payload, expires_at)
      VALUES (
        ${cleanEmail},
        ${otp},
        'signup',
        ${JSON.stringify({ username: cleanUsername, email: cleanEmail, password_hash, full_name: full_name || cleanUsername })},
        ${expiresAt.toISOString()}
      )
    `;

    // Send email via Nodemailer
    await sendVerificationEmail(cleanEmail, otp, cleanUsername);

    res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code.`,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. VERIFY SIGNUP OTP & CREATE USER
export const verifySignup = async (req, res) => {
  try {
    const { email, code } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const sql = getDb();

    const [record] = await sql`
      SELECT * FROM verification_codes 
      WHERE email = ${cleanEmail} AND code = ${code.trim()} AND type = 'signup'
    `;

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    const payload = JSON.parse(record.payload);

    // Delete existing unverified records for this email if any
    await sql`DELETE FROM users WHERE email = ${cleanEmail} AND is_verified = false`;

    // Insert user into DB
    const [newUser] = await sql`
      INSERT INTO users (username, email, password_hash, full_name, is_verified, stars_count)
      VALUES (${payload.username}, ${payload.email}, ${payload.password_hash}, ${payload.full_name}, true, 100)
      RETURNING id, username, email, full_name, avatar_url, role, stars_count, is_verified
    `;

    // Clean up used code
    await sql`DELETE FROM verification_codes WHERE id = ${record.id}`;

    // Send Welcome Email to customer
    try {
      await sendWelcomeEmail(newUser.email, newUser.username);
    } catch (e) {
      console.warn('Welcome email error:', e.message);
    }

    const token = signToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully! 🎉',
      token,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. LOGIN (Email / Username + Password)
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    const cleanId = loginId.toLowerCase().trim();
    const sql = getDb();

    const [user] = await sql`
      SELECT * FROM users 
      WHERE (email = ${cleanId} OR username = ${cleanId})
    `;

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ success: false, message: 'Please continue using Google login for this account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);

    const { password_hash, ...safeUser } = user;
    res.json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. INITIATE FORGOT PASSWORD (Send OTP)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const sql = getDb();

    // Check by email OR username (case-insensitive)
    const [user] = await sql`
      SELECT id, email, username FROM users 
      WHERE LOWER(email) = ${cleanEmail} OR LOWER(username) = ${cleanEmail}
    `;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No account found with '${email}'. Please sign up first.`,
      });
    }

    const targetEmail = user.email;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sql`DELETE FROM verification_codes WHERE email = ${targetEmail} AND type = 'forgot_password'`;
    await sql`
      INSERT INTO verification_codes (email, code, type, expires_at)
      VALUES (${targetEmail}, ${otp}, 'forgot_password', ${expiresAt.toISOString()})
    `;

    await sendPasswordResetEmail(targetEmail, otp);

    res.json({
      success: true,
      email: targetEmail,
      message: `Reset code sent to ${targetEmail}.`,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. RESET PASSWORD WITH OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const sql = getDb();

    const [record] = await sql`
      SELECT * FROM verification_codes 
      WHERE email = ${cleanEmail} AND code = ${code.trim()} AND type = 'forgot_password'
    `;

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or incorrect reset code' });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, message: 'Reset code expired. Please request a new code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await sql`
      UPDATE users SET password_hash = ${password_hash} WHERE email = ${cleanEmail}
    `;

    await sql`DELETE FROM verification_codes WHERE id = ${record.id}`;

    // Send confirmation email that password was updated
    try {
      await sendPasswordChangedConfirmation(cleanEmail);
    } catch (e) {
      console.warn('Confirmation email error:', e.message);
    }

    res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GOOGLE AUTH (CONTINUE WITH GOOGLE)
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    let payload = null;

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id.apps.googleusercontent.com') {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Decode JWT payload directly when client ID hasn't been set up yet in local dev
      const decoded = jwt.decode(credential);
      if (decoded && decoded.email) {
        payload = decoded;
      } else {
        throw new Error('Invalid Google credential token');
      }
    }

    const { email, name, picture, sub: googleId } = payload;
    const cleanEmail = email.toLowerCase().trim();
    const sql = getDb();

    // Check if user already exists
    let [user] = await sql`
      SELECT * FROM users WHERE email = ${cleanEmail} OR google_id = ${googleId}
    `;

    if (!user) {
      // Generate clean username from email or name
      const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      const uniqueUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;

      const [newUser] = await sql`
        INSERT INTO users (username, email, full_name, avatar_url, google_id, is_verified, stars_count)
        VALUES (${uniqueUsername}, ${cleanEmail}, ${name || baseUsername}, ${picture || ''}, ${googleId}, true, 100)
        RETURNING id, username, email, full_name, avatar_url, role, stars_count, is_verified
      `;
      user = newUser;
    } else if (!user.google_id) {
      // Link Google ID if user registered with same email before
      await sql`
        UPDATE users 
        SET google_id = ${googleId}, is_verified = true, avatar_url = COALESCE(avatar_url, ${picture})
        WHERE id = ${user.id}
      `;
      user.google_id = googleId;
      user.is_verified = true;
    }

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Signed in with Google successfully! ✨',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Google authentication failed' });
  }
};

