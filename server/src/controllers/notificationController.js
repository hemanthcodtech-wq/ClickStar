import { getDb } from '../config/db.js';

// Helper to create notifications
export const createNotification = async ({ userId, senderId, type, postId = null, message }) => {
  if (userId === senderId) return; // Don't notify yourself
  try {
    const sql = getDb();
    await sql`
      INSERT INTO notifications (user_id, sender_id, type, post_id, message)
      VALUES (${userId}, ${senderId}, ${type}, ${postId}, ${message})
    `;
  } catch (err) {
    console.warn('Failed to insert notification:', err.message);
  }
};

// 1. Get user notifications with sender and post details
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = parseInt(userId);
    const sql = getDb();

    const notifications = await sql`
      SELECT 
        n.*,
        u.username as sender_username,
        u.avatar_url as sender_avatar,
        u.full_name as sender_fullname,
        p.image_url as post_image,
        EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = ${currentUserId} AND f.following_id = n.sender_id) as is_following_sender
      FROM notifications n
      JOIN users u ON n.sender_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = ${currentUserId}
      ORDER BY n.created_at DESC
      LIMIT 40
    `;

    // Count unread
    const [unreadCount] = await sql`
      SELECT COUNT(*) FROM notifications 
      WHERE user_id = ${currentUserId} AND is_read = false
    `;

    res.json({
      success: true,
      unreadCount: parseInt(unreadCount.count),
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Mark all notifications as read
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const sql = getDb();

    await sql`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = ${parseInt(userId)}
    `;

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Accept Follow Request
export const acceptFollowRequest = async (req, res) => {
  try {
    const { notificationId, followerId } = req.body;
    const { userId } = req.params;
    const currentUserId = parseInt(userId);
    const sql = getDb();

    // Update follow relationship to accepted
    await sql`
      UPDATE follows 
      SET status = 'accepted'
      WHERE follower_id = ${parseInt(followerId)} AND following_id = ${currentUserId}
    `;

    // Award +5 ClickStars to current user
    await sql`UPDATE users SET stars_count = stars_count + 5 WHERE id = ${currentUserId}`;

    // Notify the requester that their follow request was accepted
    await createNotification({
      userId: parseInt(followerId),
      senderId: currentUserId,
      type: 'follow_accept',
      message: 'accepted your follow request.',
    });

    // Delete or update the notification
    if (notificationId) {
      await sql`DELETE FROM notifications WHERE id = ${parseInt(notificationId)}`;
    }

    res.json({ success: true, message: 'Follow request accepted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

