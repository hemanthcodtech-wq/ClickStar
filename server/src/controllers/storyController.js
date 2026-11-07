import { getDb } from '../config/db.js';

// Get active stories grouped by user (expires_at > NOW())
export const getActiveStories = async (req, res) => {
  try {
    const { userId } = req.query;
    const activeUserId = userId ? parseInt(userId) : null;
    const sql = getDb();

    // Fetch non-expired stories
    const stories = await sql`
      SELECT 
        s.id,
        s.user_id,
        s.media_url,
        s.media_type,
        s.music_url,
        s.music_title,
        s.created_at,
        s.expires_at,
        u.username,
        u.avatar_url,
        EXISTS(
          SELECT 1 FROM story_views sv 
          WHERE sv.story_id = s.id AND sv.viewer_id = ${activeUserId || -1}
        ) as has_viewed
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > NOW()
      ORDER BY s.created_at ASC
    `;

    // Group stories by creator
    const creatorMap = {};
    for (const story of stories) {
      if (!creatorMap[story.user_id]) {
        creatorMap[story.user_id] = {
          userId: story.user_id,
          username: story.username,
          avatarUrl: story.avatar_url,
          hasUnseen: false,
          stories: [],
        };
      }
      creatorMap[story.user_id].stories.push(story);
      if (!story.has_viewed) {
        creatorMap[story.user_id].hasUnseen = true;
      }
    }

    const grouped = Object.values(creatorMap);
    res.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new story (Cloudinary upload, expires in 24 hours, awards 20 stars)
export const createStory = async (req, res) => {
  try {
    const { userId, musicUrl, musicTitle } = req.body;
    const activeUserId = userId ? parseInt(userId) : 1;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'Image or video file is required' });
    }

    const sql = getDb();
    const mediaUrl = req.file.path;
    const publicId = req.file.filename || null;
    const isVideo = req.file.mimetype ? req.file.mimetype.startsWith('video/') : false;
    const mediaType = isVideo ? 'video' : 'image';

    const [newStory] = await sql`
      INSERT INTO stories (
        user_id, 
        media_url, 
        media_type,
        music_url,
        music_title,
        public_id, 
        expires_at
      )
      VALUES (
        ${activeUserId}, 
        ${mediaUrl}, 
        ${mediaType},
        ${musicUrl || null},
        ${musicTitle || null},
        ${publicId}, 
        NOW() + INTERVAL '24 hours'
      )
      RETURNING *
    `;

    // Award 20 stars for sharing a story
    await sql`UPDATE users SET stars_count = stars_count + 20 WHERE id = ${activeUserId}`;

    res.status(201).json({ success: true, data: newStory });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark story as viewed
export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { userId } = req.body;
    const activeUserId = userId ? parseInt(userId) : null;

    if (!activeUserId) {
      return res.status(400).json({ success: false, message: 'Viewer ID is required' });
    }

    const sql = getDb();
    await sql`
      INSERT INTO story_views (story_id, viewer_id)
      VALUES (${storyId}, ${activeUserId})
      ON CONFLICT (story_id, viewer_id) DO NOTHING
    `;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

