import { getDb } from '../config/db.js';

// Get user profile by username
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.query.currentUserId;
    const sql = getDb();

    const [user] = await sql`
      SELECT id, username, full_name, bio, avatar_url, role, stars_count, created_at
      FROM users
      WHERE username = ${username}
    `;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Followers & Following counts
    const [followersCount] = await sql`SELECT COUNT(*) FROM follows WHERE following_id = ${user.id}`;
    const [followingCount] = await sql`SELECT COUNT(*) FROM follows WHERE follower_id = ${user.id}`;
    
    // Check if current user is following this profile or has a pending request
    let isFollowing = false;
    let hasPendingRequest = false;
    if (currentUserId) {
      const [f] = await sql`SELECT 1 FROM follows WHERE follower_id = ${currentUserId} AND following_id = ${user.id}`;
      isFollowing = !!f;

      if (!isFollowing) {
        const [req] = await sql`SELECT 1 FROM follow_requests WHERE requester_id = ${currentUserId} AND target_id = ${user.id} AND status = 'pending'`;
        hasPendingRequest = !!req;
      }
    }

    // Get list of followers with user info
    const followers = await sql`
      SELECT u.id, u.username, u.full_name, u.avatar_url, u.stars_count, u.role
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ${user.id}
      ORDER BY f.created_at DESC
    `;

    // Get list of users this profile is following
    const following = await sql`
      SELECT u.id, u.username, u.full_name, u.avatar_url, u.stars_count, u.role
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ${user.id}
      ORDER BY f.created_at DESC
    `;

    // Calculate stars breakdown (e.g. earned from posts vs current balance)
    const [likesAgg] = await sql`
      SELECT COALESCE(SUM(likes_count), 0)::int as total_likes_received,
             COALESCE(SUM(comments_count), 0)::int as total_comments_received
      FROM posts 
      WHERE user_id = ${user.id}
    `;

    // Get user posts
    const posts = await sql`
      SELECT * FROM posts WHERE user_id = ${user.id} ORDER BY created_at DESC
    `;

    // Get user saved posts (if viewing own profile)
    let savedPosts = [];
    if (currentUserId && parseInt(currentUserId) === user.id) {
      savedPosts = await sql`
        SELECT p.*, u.username, u.avatar_url 
        FROM saves s
        JOIN posts p ON s.post_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE s.user_id = ${user.id}
        ORDER BY s.created_at DESC
      `;
    }

    res.json({
      success: true,
      data: {
        ...user,
        postsCount: posts.length,
        followersCount: followers.length,
        followingCount: following.length,
        followers,
        following,
        starsBreakdown: {
          balance: user.stars_count || 0,
          totalLikesReceived: likesAgg.total_likes_received || 0,
          totalCommentsReceived: likesAgg.total_comments_received || 0,
        },
        isFollowing,
        hasPendingRequest,
        posts,
        savedPosts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users (demo user selector / search)
export const getAllUsers = async (req, res) => {
  try {
    const sql = getDb();
    const users = await sql`
      SELECT id, username, full_name, bio, avatar_url, role, stars_count
      FROM users
      ORDER BY stars_count DESC
    `;
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile (with direct Cloudinary file upload or text details)
export const updateProfile = async (req, res) => {
  try {
    const { userId, full_name, bio } = req.body;
    let avatar_url = req.body.avatar_url;

    // If an image file was uploaded via Multer / Cloudinary
    if (req.file) {
      avatar_url = req.file.path;
    }

    const sql = getDb();
    const [updated] = await sql`
      UPDATE users
      SET 
        full_name = COALESCE(${full_name}, full_name),
        bio = COALESCE(${bio}, bio),
        avatar_url = COALESCE(${avatar_url}, avatar_url)
      WHERE id = ${userId}
      RETURNING id, username, full_name, bio, avatar_url, role, stars_count
    `;

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Pending Follow Requests for a user
export const getFollowRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const sql = getDb();

    const requests = await sql`
      SELECT 
        fr.id as request_id,
        fr.created_at,
        u.id as requester_id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.stars_count,
        u.role
      FROM follow_requests fr
      JOIN users u ON fr.requester_id = u.id
      WHERE fr.target_id = ${parseInt(userId)} AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `;

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error getting follow requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept Follow Request
export const acceptFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body; // Target user accepting the request
    const sql = getDb();

    // Verify request exists
    const [request] = await sql`
      SELECT * FROM follow_requests 
      WHERE id = ${parseInt(requestId)} AND target_id = ${parseInt(userId)}
    `;

    if (!request) {
      return res.status(404).json({ success: false, message: 'Follow request not found' });
    }

    // 1. Delete request
    await sql`DELETE FROM follow_requests WHERE id = ${parseInt(requestId)}`;

    // 2. Add follower to follows table (requester follows target)
    await sql`
      INSERT INTO follows (follower_id, following_id)
      VALUES (${request.requester_id}, ${request.target_id})
      ON CONFLICT (follower_id, following_id) DO NOTHING
    `;

    // 3. Award followed creator +5 ClickStars
    await sql`UPDATE users SET stars_count = stars_count + 5 WHERE id = ${request.target_id}`;

    // 4. Send notification back to requester that request was accepted
    const [accepter] = await sql`SELECT username FROM users WHERE id = ${request.target_id}`;
    await sql`
      INSERT INTO notifications (user_id, sender_id, type, message)
      VALUES (
        ${request.requester_id}, 
        ${request.target_id}, 
        'follow_accept', 
        'accepted your follow request. (+5 ClickStars)'
      )
    `;

    res.json({ success: true, message: 'Follow request accepted' });
  } catch (error) {
    console.error('Accept follow error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Decline Follow Request
export const declineFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;
    const sql = getDb();

    await sql`
      DELETE FROM follow_requests 
      WHERE id = ${parseInt(requestId)} AND target_id = ${parseInt(userId)}
    `;

    res.json({ success: true, message: 'Follow request declined' });
  } catch (error) {
    console.error('Decline follow error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

