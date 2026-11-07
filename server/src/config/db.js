import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

let sql = null;

export const getDb = () => {
  if (!sql) {
    if (process.env.DATABASE_URL) {
      sql = neon(process.env.DATABASE_URL);
      return sql;
    }
    throw new Error('DATABASE_URL is missing. Please configure it in server/.env');
  }
  return sql;
};

export const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is not configured. Skipping database initialization.');
    return;
  }
  try {
    const db = getDb();
    
    // 1. Users Table (with is_verified and google_id support)
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        full_name VARCHAR(100),
        bio TEXT DEFAULT '',
        avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
        role VARCHAR(20) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        stars_count INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure columns exist if table was already created
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)`;

    // 2. Verification Codes / OTP Table (For Signup & Password Reset)
    await db`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        code VARCHAR(10) NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'signup' or 'forgot_password'
        payload TEXT,             -- JSON string of pending registration data if signup
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Posts Table
    await db`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        caption TEXT DEFAULT '',
        image_url TEXT NOT NULL,
        public_id VARCHAR(255),
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        is_flagged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 4. Likes Table
    await db`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      )
    `;

    // 5. Comments Table
    await db`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 6. Saves Table (Bookmark posts)
    await db`
      CREATE TABLE IF NOT EXISTS saves (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      )
    `;

    // 7. Follows Table (Follow creators)
    await db`
      CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id INT REFERENCES users(id) ON DELETE CASCADE,
        following_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `;

    // 7b. Follow Requests Table (Private approval flow: status = 'pending' | 'accepted' | 'rejected')
    await db`
      CREATE TABLE IF NOT EXISTS follow_requests (
        id SERIAL PRIMARY KEY,
        requester_id INT REFERENCES users(id) ON DELETE CASCADE,
        target_id INT REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, target_id)
      )
    `;

    // 8. Hashtags & Post Hashtags Tables
    await db`
      CREATE TABLE IF NOT EXISTS hashtags (
        id SERIAL PRIMARY KEY,
        tag VARCHAR(100) UNIQUE NOT NULL,
        posts_count INT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db`
      CREATE TABLE IF NOT EXISTS post_hashtags (
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        hashtag_id INT REFERENCES hashtags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, hashtag_id)
      )
    `;

    // 9. Stories & Story Views Tables (24h expiring media)
    await db`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        media_url TEXT NOT NULL,
        media_type VARCHAR(20) DEFAULT 'image',
        music_url TEXT,
        music_title VARCHAR(150),
        public_id VARCHAR(255),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure columns exist on already-created tables
    await db`ALTER TABLE stories ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image'`;
    await db`ALTER TABLE stories ADD COLUMN IF NOT EXISTS music_url TEXT`;
    await db`ALTER TABLE stories ADD COLUMN IF NOT EXISTS music_title VARCHAR(150)`;
    await db`
      CREATE TABLE IF NOT EXISTS story_views (
        id SERIAL PRIMARY KEY,
        story_id INT REFERENCES stories(id) ON DELETE CASCADE,
        viewer_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(story_id, viewer_id)
      )
    `;

    // Ensure default demo admin and users exist
    const usersCount = await db`SELECT COUNT(*) FROM users`;
    if (parseInt(usersCount[0].count) === 0) {
      await db`
        INSERT INTO users (username, email, password_hash, full_name, bio, role, is_verified, stars_count, avatar_url)
        VALUES 
          ('clickstar_admin', 'admin@clickstar.app', 'demo_hash', 'ClickStar Admin', 'Official ClickStar Platform Admin', 'admin', true, 500, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'),
          ('sarah_lens', 'sarah@clickstar.app', 'demo_hash', 'Sarah Jenkins', 'Capturing sunsets and city lights 📸✨', 'user', true, 1250, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150'),
          ('alex_travels', 'alex@clickstar.app', 'demo_hash', 'Alex Rivera', 'Digital nomad | 42 countries explored ✈️', 'user', true, 980, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150')
      `;

      const seedUsers = await db`SELECT id, username FROM users`;
      const sarah = seedUsers.find(u => u.username === 'sarah_lens');
      if (sarah) {
        await db`
          INSERT INTO posts (user_id, caption, image_url, likes_count, comments_count)
          VALUES 
            (${sarah.id}, 'Sunset over the bay ✨ #goldenhour #clickstar', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200', 42, 3),
            (${sarah.id}, 'Minimalist interior design vibes 🌿', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200', 31, 1)
        `;
      }
    }

    console.log('✅ Neon DB schema checked and initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Neon DB:', error.message);
  }
};
