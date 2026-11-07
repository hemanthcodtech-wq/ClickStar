import { getDb } from '../config/db.js';
import { cloudinary } from '../config/cloudinary.js';
import { createNotification } from './notificationController.js';

// Get feed posts (with author details, has_liked, has_saved, is_following, and hashtag filter)
export const getPosts = async (req, res) => {
  try {
    const sql = getDb();
    const currentUserId = req.query.userId || 1;
    const { tag } = req.query;

    let posts;
    if (tag && tag.trim()) {
      const cleanTag = tag.toLowerCase().replace('#', '').trim();
      posts = await sql`
        SELECT 
          p.*,
          u.username,
          u.full_name,
          u.avatar_url,
          EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ${currentUserId}) as has_liked,
          EXISTS(SELECT 1 FROM saves s WHERE s.post_id = p.id AND s.user_id = ${currentUserId}) as has_saved,
          EXISTS(SELECT 1 FROM follows f WHERE f.following_id = p.user_id AND f.follower_id = ${currentUserId}) as is_following
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN post_hashtags ph ON ph.post_id = p.id
        JOIN hashtags h ON h.id = ph.hashtag_id
        WHERE LOWER(h.tag) = ${cleanTag}
        ORDER BY p.created_at DESC
      `;
    } else {
      posts = await sql`
        SELECT 
          p.*,
          u.username,
          u.full_name,
          u.avatar_url,
          EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ${currentUserId}) as has_liked,
          EXISTS(SELECT 1 FROM saves s WHERE s.post_id = p.id AND s.user_id = ${currentUserId}) as has_saved,
          EXISTS(SELECT 1 FROM follows f WHERE f.following_id = p.user_id AND f.follower_id = ${currentUserId}) as is_following
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `;
    }

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to extract hashtags from caption (e.g. #interior #home)
const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { caption, userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const imageUrl = req.file.path;
    const publicId = req.file.filename;
    const activeUserId = userId ? parseInt(userId) : 1;

    const sql = getDb();
    const [newPost] = await sql`
      INSERT INTO posts (user_id, caption, image_url, public_id)
      VALUES (${activeUserId}, ${caption || ''}, ${imageUrl}, ${publicId})
      RETURNING *
    `;

    // Process and index hashtags from caption
    const tags = extractHashtags(caption);
    for (const tag of tags) {
      const [hashtagRecord] = await sql`
        INSERT INTO hashtags (tag, posts_count)
        VALUES (${tag}, 1)
        ON CONFLICT (tag) DO UPDATE 
        SET posts_count = hashtags.posts_count + 1
        RETURNING id
      `;

      if (hashtagRecord) {
        await sql`
          INSERT INTO post_hashtags (post_id, hashtag_id)
          VALUES (${newPost.id}, ${hashtagRecord.id})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // Award user 100 stars for creating a post
    await sql`
      UPDATE users SET stars_count = stars_count + 100 WHERE id = ${activeUserId}
    `;

    // Fetch user details with the newly created post
    const [postWithAuthor] = await sql`
      SELECT 
        p.*,
        u.username,
        u.full_name,
        u.avatar_url,
        false as has_liked,
        false as has_saved,
        false as is_following
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${newPost.id}
    `;

    res.status(201).json({ success: true, data: postWithAuthor });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search / Autocomplete Hashtags
export const searchHashtags = async (req, res) => {
  try {
    const { q } = req.query;
    const sql = getDb();

    if (!q || !q.trim()) {
      // Return top trending tags
      const topTags = await sql`
        SELECT id, tag, posts_count 
        FROM hashtags 
        ORDER BY posts_count DESC 
        LIMIT 10
      `;
      return res.json({ success: true, data: topTags });
    }

    const cleanQuery = q.toLowerCase().replace('#', '').trim();
    const matchingTags = await sql`
      SELECT id, tag, posts_count 
      FROM hashtags 
      WHERE tag ILIKE ${cleanQuery + '%'}
      ORDER BY posts_count DESC 
      LIMIT 8
    `;

    res.json({ success: true, data: matchingTags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Like
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const activeUserId = userId ? parseInt(userId) : 1;
    const sql = getDb();

    // Check if like exists
    const [existing] = await sql`
      SELECT id FROM likes WHERE post_id = ${id} AND user_id = ${activeUserId}
    `;

    let liked = false;
    if (existing) {
      // Unlike
      await sql`DELETE FROM likes WHERE id = ${existing.id}`;
      await sql`UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ${id}`;
      liked = false;
    } else {
      // Like
      await sql`INSERT INTO likes (post_id, user_id) VALUES (${id}, ${activeUserId})`;
      await sql`UPDATE posts SET likes_count = likes_count + 1 WHERE id = ${id}`;
      liked = true;

      // Award author 10 stars on received like and trigger live notification
      const [post] = await sql`SELECT user_id, image_url FROM posts WHERE id = ${id}`;
      if (post && post.user_id) {
        await sql`UPDATE users SET stars_count = stars_count + 10 WHERE id = ${post.user_id}`;
        
        // Create Notification for the author
        await createNotification({
          userId: post.user_id,
          senderId: activeUserId,
          type: 'like',
          postId: parseInt(id),
          message: 'liked your photo. (+10 ClickStars)',
        });
      }
    }

    const [updatedPost] = await sql`SELECT likes_count FROM posts WHERE id = ${id}`;

    res.json({ success: true, liked, likesCount: updatedPost.likes_count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Post Comments
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();

    const comments = await sql`
      SELECT 
        c.*,
        u.username,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ${id}
      ORDER BY c.created_at ASC
    `;

    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentText, userId } = req.body;
    const activeUserId = userId ? parseInt(userId) : 1;

    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const sql = getDb();
    const [newComment] = await sql`
      INSERT INTO comments (post_id, user_id, comment_text)
      VALUES (${id}, ${activeUserId}, ${commentText.trim()})
      RETURNING *
    `;

    await sql`UPDATE posts SET comments_count = comments_count + 1 WHERE id = ${id}`;

    // Trigger notification to the post author & award 5 stars
    const [post] = await sql`SELECT user_id FROM posts WHERE id = ${id}`;
    if (post && post.user_id) {
      // Award author 5 stars on received comment
      await sql`UPDATE users SET stars_count = stars_count + 5 WHERE id = ${post.user_id}`;

      await createNotification({
        userId: post.user_id,
        senderId: activeUserId,
        type: 'comment',
        postId: parseInt(id),
        message: `commented: "${commentText.trim().slice(0, 45)}" (+5 ClickStars)`,
      });
    }

    const [commentWithAuthor] = await sql`
      SELECT 
        c.*,
        u.username,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${newComment.id}
    `;

    res.status(201).json({ success: true, data: commentWithAuthor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Save / Bookmark
export const toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const activeUserId = userId ? parseInt(userId) : 1;
    const sql = getDb();

    const [existing] = await sql`
      SELECT id FROM saves WHERE post_id = ${id} AND user_id = ${activeUserId}
    `;

    let saved = false;
    if (existing) {
      await sql`DELETE FROM saves WHERE id = ${existing.id}`;
      saved = false;
    } else {
      await sql`INSERT INTO saves (post_id, user_id) VALUES (${id}, ${activeUserId})`;
      saved = true;
    }

    res.json({ success: true, saved, message: saved ? 'Post saved' : 'Post removed from saves' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Follow Creator: Creates a pending follow request and notifies target creator
export const toggleFollow = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId } = req.body;
    const followerId = userId ? parseInt(userId) : 1;
    const followingId = parseInt(targetUserId);

    if (followerId === followingId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const sql = getDb();

    // 1. Check if already following
    const [existingFollow] = await sql`
      SELECT id FROM follows WHERE follower_id = ${followerId} AND following_id = ${followingId}
    `;

    if (existingFollow) {
      // Unfollow
      await sql`DELETE FROM follows WHERE id = ${existingFollow.id}`;
      // Remove any pending request
      await sql`DELETE FROM follow_requests WHERE requester_id = ${followerId} AND target_id = ${followingId}`;

      return res.json({ 
        success: true, 
        status: 'none', 
        following: false, 
        message: 'Unfollowed creator' 
      });
    }

    // 2. Check if a pending follow request already exists
    const [existingRequest] = await sql`
      SELECT id, status FROM follow_requests 
      WHERE requester_id = ${followerId} AND target_id = ${followingId}
    `;

    if (existingRequest && existingRequest.status === 'pending') {
      // Cancel request
      await sql`DELETE FROM follow_requests WHERE id = ${existingRequest.id}`;
      return res.json({ 
        success: true, 
        status: 'none', 
        following: false, 
        message: 'Follow request cancelled' 
      });
    }

    // 3. Create a new Pending Follow Request
    await sql`
      INSERT INTO follow_requests (requester_id, target_id, status)
      VALUES (${followerId}, ${followingId}, 'pending')
      ON CONFLICT (requester_id, target_id) DO UPDATE SET status = 'pending'
    `;

    // 4. Send Notification to target creator
    const [requester] = await sql`SELECT username FROM users WHERE id = ${followerId}`;
    await createNotification({
      userId: followingId,
      senderId: followerId,
      type: 'follow_request',
      message: 'sent you a follow request.',
    });

    res.json({ 
      success: true, 
      status: 'pending', 
      following: false, 
      message: 'Follow request sent! Pending creator approval.' 
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete post (user or admin)
export const deletePost = async (req, res) => {
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
        console.warn('Cloudinary destroy error:', cErr.message);
      }
    }

    await sql`DELETE FROM posts WHERE id = ${id}`;

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
