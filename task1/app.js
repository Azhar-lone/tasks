import express from 'express';
import mongoose from 'mongoose';
import taskRoutes from './router.js';
import errorHandler from './middleware.js';

const app = express();

app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

mongoose
  .connect('mongodb://localhost:27017/taskdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));