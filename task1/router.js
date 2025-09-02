import express from 'express';
import Task from './model.js';
import { query, validationResult } from 'express-validator';

const router = express.Router();

const validateQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer greater than 0'),
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

      const { limit = 10, page = 1, status } = req.query;

      const parsedLimit = parseInt(limit);
      const parsedPage = parseInt(page);
      const skip = (parsedPage - 1) * parsedLimit;

      const filter = status ? { status } : {};

      const [tasks, totalCount] = await Promise.all([
        Task.find(filter)
          .select('title status priority createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parsedLimit)
          .lean(),
        Task.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalCount / parsedLimit);

      res.json({
        items: tasks,
        pagination: {
          currentPage: parsedPage,
          totalPages,
          totalItems: totalCount,
          hasNextPage: parsedPage < totalPages,
          hasPrevPage: parsedPage > 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
