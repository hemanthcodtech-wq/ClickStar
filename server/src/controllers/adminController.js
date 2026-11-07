import { getDb } from '../config/db.js';
import { cloudinary } from '../config/cloudinary.js';
import { createNotification } from './notificationController.js';

// Get platform telemetry & stats
export const getAdminStats = async (req, res) => {
  try {
    const sql = getDb();

    const [userCount] = await sql`SELECT COUNT(*) FROM users`;
    const [postCount] = await sql`SELECT COUNT(*) FROM posts`;
    const [likesCount] = await sql`SELECT COUNT(*) FROM likes`;
    const [commentsCount] = await sql`SELECT COUNT(*) FROM comments`;
    const [flaggedCount] = await sql`SELECT COUNT(*) FROM posts WHERE is_flagged = true`;
    const [starsSum] = await sql`SELECT COALESCE(SUM(stars_count), 0) as total_stars FROM users`;
    const [activeStories] = await sql`SELECT COUNT(*) FROM stories WHERE expires_at > NOW()`;

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(userCount.count),
        totalPosts: parseInt(postCount.count),
        totalLikes: parseInt(likesCount.count),
        totalComments: parseInt(commentsCount.count),
        flaggedPosts: parseInt(flaggedCount.count),
        totalStars: parseInt(starsSum.total_stars),
        activeStories: parseInt(activeStories.count),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin list all posts with user info and flag controls
export const getAdminPosts = async (req, res) => {
  try {
    const sql = getDb();

    const posts = await sql`
      SELECT 
        p.*,
        u.username,
        u.email,
        u.role
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.is_flagged DESC, p.created_at DESC
    `;

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle post flag & notify user
export const toggleFlagPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body || {};
    const sql = getDb();

    // 1. Get current post details
    const [existingPost] = await sql`
      SELECT p.*, u.username, u.id as author_id
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${id}
    `;

    if (!existingPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const nextFlagged = !existingPost.is_flagged;

    // 2. Update post flag status
    const [updatedPost] = await sql`
      UPDATE posts 
      SET is_flagged = ${nextFlagged}
      WHERE id = ${id}
      RETURNING *
    `;

    // 3. If post was flagged by admin, send notification to the user
    if (nextFlagged) {
      // Find admin user or use default superadmin
      let activeAdminId = adminId ? parseInt(adminId) : null;
      if (!activeAdminId) {
        const [superAdmin] = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
        activeAdminId = superAdmin ? superAdmin.id : 1;
      }

      await createNotification({
        userId: existingPost.author_id,
        senderId: activeAdminId,
        type: 'moderation_flag',
        postId: existingPost.id,
        message: 'Your post was flagged by an Administrator for review due to community safety standards.',
      });
    }

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Error toggling flag:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin delete any post
export const adminDeletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();

    const [post] = await sql`SELECT * FROM posts WHERE id = ${id}`;
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.public_id) {
      try {
        await cloudinary.uploader.destroy(post.public_id);
      } catch (cErr) {
        console.warn('Cloudinary delete warning:', cErr.message);
      }
    }

    await sql`DELETE FROM posts WHERE id = ${id}`;

    res.json({ success: true, message: 'Post deleted by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin list all users
export const getAdminUsers = async (req, res) => {
  try {
    const sql = getDb();

    const users = await sql`
      SELECT 
        u.*,
        COUNT(p.id) as posts_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Monthly Leaderboard Analytics: Calculates total likes gained across all posts in a specific month
export const getAdminMonthlyLeaderboard = async (req, res) => {
  try {
    const { month, year } = req.query;
    const sql = getDb();

    // Default to current month and year if not specified
    const targetDate = new Date();
    const targetMonth = month ? parseInt(month) : targetDate.getMonth() + 1; // 1-12
    const targetYear = year ? parseInt(year) : targetDate.getFullYear();

    // Query all registered creators with their posts for the target month
    // LEFT JOIN ensures every registered creator is listed in the evaluation table,
    // even if they published 0 posts or have 0 likes in this month.
    const monthlyLeaderboard = await sql`
      SELECT 
        u.id as user_id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.role,
        u.stars_count,
        COUNT(DISTINCT p.id)::int as monthly_posts_count,
        COALESCE(SUM(p.likes_count), 0)::int as monthly_likes_received,
        COALESCE(SUM(p.comments_count), 0)::int as monthly_comments_received,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'caption', p.caption,
              'image_url', p.image_url,
              'likes_count', p.likes_count,
              'comments_count', p.comments_count,
              'created_at', p.created_at,
              'is_flagged', p.is_flagged
            ) ORDER BY p.likes_count DESC, p.created_at DESC
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) as monthly_posts
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id 
        AND EXTRACT(MONTH FROM p.created_at) = ${targetMonth} 
        AND EXTRACT(YEAR FROM p.created_at) = ${targetYear}
      GROUP BY u.id
      ORDER BY monthly_likes_received DESC, monthly_posts_count DESC, u.stars_count DESC
    `;

    // Also get previous months summary for historical archive dropdown
    const availableMonths = await sql`
      SELECT DISTINCT 
        EXTRACT(MONTH FROM created_at)::int as month,
        EXTRACT(YEAR FROM created_at)::int as year
      FROM posts
      ORDER BY year DESC, month DESC
    `;

    res.json({
      success: true,
      data: {
        targetMonth,
        targetYear,
        leader: monthlyLeaderboard.length > 0 ? monthlyLeaderboard[0] : null,
        rankings: monthlyLeaderboard,
        availableMonths,
      },
    });
  } catch (error) {
    console.error('Error fetching admin monthly leaderboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role or ClickStars
export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, starsAdjustment } = req.body;
    const sql = getDb();

    let updatedUser;
    if (role) {
      [updatedUser] = await sql`
        UPDATE users SET role = ${role} WHERE id = ${id} RETURNING *
      `;
    }

    if (starsAdjustment !== undefined) {
      [updatedUser] = await sql`
        UPDATE users SET stars_count = GREATEST(0, stars_count + ${parseInt(starsAdjustment)}) WHERE id = ${id} RETURNING *
      `;
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
