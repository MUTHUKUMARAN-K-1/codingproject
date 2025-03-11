// backend/routes/community.js
const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const DataTypes = require('sequelize').DataTypes;
const ForumPost = require('../models/forumPost')(sequelize, DataTypes);
const Channel = require('../models/channel')(sequelize, DataTypes);
const Message = require('../models/message')(sequelize, DataTypes);

// Get all channels
router.get('/channels', async (req, res) => {
  try {
    const channels = await Channel.findAll();
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get channels' });
  }
});

// Create a new channel
router.post('/channels', async (req, res) => {
  const { name, description } = req.body;
  try {
    const channel = await Channel.create({ name, description });
    res.json({ message: 'Channel created', channel });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Create a new forum post
router.post('/posts', async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = await ForumPost.create({ title, content, likes: 0 });
    res.json({ message: 'Post created', post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Send a chat message (for a channel)
router.post('/channels/:channelId/messages', async (req, res) => {
  const { channelId } = req.params;
  const { senderId, content } = req.body;
  try {
    const message = await Message.create({ channelId, senderId, content });
    res.json({ message: 'Message sent', messageData: message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
