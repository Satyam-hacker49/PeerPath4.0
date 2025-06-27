import express from 'express';
import jwt from 'jsonwebtoken';
import Doubt from '../models/Doubt.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Multer setup for image uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'solution-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({ storage });

// Serve uploaded images statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create a new doubt
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    // Handle tags field properly - it could be string or array
    let tagsArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        tagsArray = tags.filter(tag => tag && tag.trim());
      }
    }

    const doubt = new Doubt({
      user: req.user.userId,
      title,
      content,
      category,
      tags: tagsArray
    });

    await doubt.save();

    // Increment user's doubts asked count
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { doubtsAsked: 1 }
    });

    // Populate user info
    await doubt.populate('user', 'username profilePhoto');

    res.status(201).json({
      message: 'Doubt created successfully',
      doubt
    });

  } catch (error) {
    console.error('Create doubt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all doubts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const doubts = await Doubt.find(query)
      .populate('user', 'username profilePhoto')
      .populate('solutions.user', 'username profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Doubt.countDocuments(query);

    res.json({
      doubts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });

  } catch (error) {
    console.error('Get doubts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific doubt by ID
router.get('/:id', async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('user', 'username profilePhoto')
      .populate('solutions.user', 'username profilePhoto');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Increment views
    await doubt.incrementViews();

    res.json(doubt);

  } catch (error) {
    console.error('Get doubt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a solution to a doubt (with image upload support)
router.post('/:id/solutions', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Build solution object
    const solutionObj = {
      user: req.user.userId,
      content: content || ''
    };
    if (req.file) {
      solutionObj.image = `/uploads/${req.file.filename}`;
    }

    doubt.solutions.push(solutionObj);
    await doubt.save();

    // Increment the user's doubtsSolved count
    await User.findByIdAndUpdate(req.user.userId, { $inc: { doubtsSolved: 1 } });

    // Populate the new solution
    await doubt.populate('solutions.user', 'username profilePhoto');

    res.json({
      message: 'Solution added successfully',
      doubt
    });
  } catch (error) {
    console.error('Add solution error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept a solution
router.put('/:id/solutions/:solutionId/accept', authenticateToken, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if the user is the doubt creator
    if (doubt.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the doubt creator can accept solutions' });
    }

    await doubt.acceptSolution(req.params.solutionId);

    // Increment the solver's doubts solved count
    const solution = doubt.solutions.id(req.params.solutionId);
    if (solution) {
      await User.findByIdAndUpdate(solution.user, {
        $inc: { doubtsSolved: 1 }
      });
    }

    res.json({
      message: 'Solution accepted successfully',
      doubt
    });

  } catch (error) {
    console.error('Accept solution error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get trending doubts (most viewed)
router.get('/trending/views', async (req, res) => {
  try {
    const trendingDoubts = await Doubt.find()
      .populate('user', 'username profilePhoto')
      .sort({ views: -1 })
      .limit(5);

    res.json(trendingDoubts);

  } catch (error) {
    console.error('Get trending doubts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's doubts
router.get('/user/:userId', async (req, res) => {
  try {
    const doubts = await Doubt.find({ user: req.params.userId })
      .populate('user', 'username profilePhoto')
      .sort({ createdAt: -1 });

    res.json(doubts);

  } catch (error) {
    console.error('Get user doubts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get weekly doubts count for a user
router.get('/weekly/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Authenticated user ID:', req.user.userId);
    console.log('Requested user ID:', userId);
    
    // Check if the authenticated user is requesting their own data
    if (req.user.userId !== userId) {
      console.log('User trying to access another user\'s data');
      return res.status(403).json({ message: 'You can only view your own weekly doubts' });
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6); // 7 days including today
    weekAgo.setHours(0, 0, 0, 0); // Start of 7 days ago

    console.log('Fetching weekly doubts for user:', userId);
    console.log('Date range:', { weekAgo, today });

    // First, let's check if the user has any doubts at all
    const totalDoubts = await Doubt.countDocuments({ user: new mongoose.Types.ObjectId(userId) });
    console.log('Total doubts for user:', totalDoubts);

    // Aggregate doubts by day for the past week
    const result = await Doubt.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: weekAgo, $lte: today }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('Aggregation result:', result);

    // Fill in days with 0 if no doubts were asked
    const data = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo);
      date.setDate(weekAgo.getDate() + i);
      const dateString = date.toISOString().slice(0, 10);
      const found = result.find(r => r._id === dateString);
      data.push({ 
        date: dateString, 
        count: found ? found.count : 0 
      });
    }

    console.log('Final weekly data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching weekly doubts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark a doubt as solved
router.put('/:id/solve', authenticateToken, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }
    // Only the doubt creator or a solver can mark as solved
    if (doubt.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the doubt creator can mark as solved' });
    }
    doubt.isSolved = true;
    await doubt.save();
    // Increment the user's doubtsSolved count
    await User.findByIdAndUpdate(req.user.userId, { $inc: { doubtsSolved: 1 } });
    res.json({ message: 'Doubt marked as solved', doubt });
  } catch (error) {
    console.error('Mark as solved error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like or unlike a doubt
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }
    const userId = req.user.userId;
    const index = doubt.likes.findIndex(id => id.toString() === userId);
    if (index === -1) {
      // Not liked yet, add like
      doubt.likes.push(userId);
    } else {
      // Already liked, remove like
      doubt.likes.splice(index, 1);
    }
    await doubt.save();
    res.json({ likes: doubt.likes.length, doubt });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like/unlike doubt', error: error.message });
  }
});

export default router; 