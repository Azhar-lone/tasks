import express from 'express';
import Task from '../models/Task.js';
import { query, validationResult } from 'express-validator';

const router = express.Router();

const validateQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50'),
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  query('status')
    .optional()
    .isIn(['todo', 'doing', 'done'])
    .withMessage('Status must be one of: todo, doing, done'),
];

router.get(
  '/',
  validateQuery,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error('Invalid query parameters');
        error.status = 400;
        return next(error);
      }

      const { limit = 10, skip = 0, status } = req.query;

      const query = status ? { status } : {};

      const tasks = await Task.find(query)
        .select('title status priority createdAt')
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .lean();

      const nextSkip = tasks.length === parseInt(limit) ? parseInt(skip) + parseInt(limit) : null;

      res.json({
        items: tasks,
        nextSkip,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;