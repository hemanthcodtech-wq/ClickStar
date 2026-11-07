import { getDb } from '../config/db.js';

// Unified search for users, hashtags, and posts
export const searchGlobal = async (req, res) => {
  try {
    const { q, type } = req.query;
    const sql = getDb();

    if (!q || !q.trim()) {
      // Default explore state: trending posts + top creators + popular hashtags
      const [topCreators, trendingPosts, trendingTags] = await Promise.all([
        sql`
          SELECT id, username, full_name, avatar_url, role, stars_count
          FROM users
          ORDER BY stars_count DESC
          LIMIT 12
        `,
        sql`
          SELECT p.*, u.username, u.avatar_url
          FROM posts p
          JOIN users u ON p.user_id = u.id
          ORDER BY p.likes_count DESC, p.created_at DESC
          LIMIT 18
        `,
        sql`
          SELECT id, tag, posts_count
          FROM hashtags
          ORDER BY posts_count DESC
          LIMIT 10
        `
      ]);

      return res.json({
        success: true,
        data: {
          users: topCreators,
          posts: trendingPosts,
          hashtags: trendingTags,
        },
      });
    }

    const queryStr = `%${q.trim().toLowerCase()}%`;
    const cleanTag = q.trim().replace(/^#/, '').toLowerCase();
    const tagQueryStr = `%${cleanTag}%`;

    // 1. Search Users
    const users = await sql`
      SELECT id, username, full_name, avatar_url, role, stars_count
      FROM users
      WHERE LOWER(username) LIKE ${queryStr} OR LOWER(full_name) LIKE ${queryStr}
      ORDER BY stars_count DESC
      LIMIT 15
    `;

    // 2. Search Hashtags
    const hashtags = await sql`
      SELECT id, tag, posts_count
      FROM hashtags
      WHERE LOWER(tag) LIKE ${tagQueryStr}
      ORDER BY posts_count DESC
      LIMIT 15
    `;

    // 3. Search Posts by caption or matching hashtag
    const posts = await sql`
      SELECT DISTINCT 
        p.*, 
        u.username, 
        u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN post_hashtags ph ON ph.post_id = p.id
      LEFT JOIN hashtags h ON h.id = ph.hashtag_id
      WHERE LOWER(p.caption) LIKE ${queryStr} 
         OR LOWER(h.tag) LIKE ${tagQueryStr}
         OR LOWER(u.username) LIKE ${queryStr}
      ORDER BY p.likes_count DESC, p.created_at DESC
      LIMIT 24
    `;

    res.json({
      success: true,
      data: {
        query: q.trim(),
        users,
        hashtags,
        posts,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

