import { getDb } from '../config/db.js';

export const getLeaderboard = async (req, res) => {
  try {
    const { month, year } = req.query;
    const sql = getDb();

    // 1. All-Time Top Stars (Ranked by stars_count)
    const topCreators = await sql`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.stars_count,
        COUNT(p.id) as total_posts,
        COALESCE(SUM(p.likes_count), 0) as total_likes_received
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY u.stars_count DESC, total_likes_received DESC
      LIMIT 20
    `;

    // 2. Trending Posts (Ranked by likes_count)
    const trendingPosts = await sql`
      SELECT 
        p.*,
        u.username,
        u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.likes_count DESC, p.created_at DESC
      LIMIT 10
    `;

    // 3. Monthly Leaders (Calculates highest likes across all posts in current calendar month)
    const targetDate = new Date();
    const targetMonth = month ? parseInt(month) : targetDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : targetDate.getFullYear();

    const monthlyCreators = await sql`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.stars_count,
        COUNT(DISTINCT p.id)::int as monthly_posts_count,
        COALESCE(SUM(p.likes_count), 0)::int as monthly_likes_received
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id 
        AND EXTRACT(MONTH FROM p.created_at) = ${targetMonth} 
        AND EXTRACT(YEAR FROM p.created_at) = ${targetYear}
      GROUP BY u.id
      ORDER BY monthly_likes_received DESC, monthly_posts_count DESC, u.stars_count DESC
      LIMIT 20
    `;

    res.json({
      success: true,
      data: {
        topCreators,
        trendingPosts,
        monthlyCreators,
        currentMonth: targetMonth,
        currentYear: targetYear,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

