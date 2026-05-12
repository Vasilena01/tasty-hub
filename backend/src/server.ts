import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Import routes
import authRoutes from './routes/authRoutes';
import recipeRoutes from './routes/recipeRoutes';
import ratingRoutes from './routes/ratingRoutes';
import savedRecipeRoutes from './routes/savedRecipeRoutes';
import mealPlanRoutes from './routes/mealPlanRoutes';
import shoppingListRoutes from './routes/shoppingListRoutes';
import followerRoutes from './routes/followerRoutes';
import userRoutes from './routes/userRoutes';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api', ratingRoutes); // For /api/recipes/:id/ratings
app.use('/api/saved-recipes', savedRecipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    message: 'Recipe Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/db-test', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: (error as Error).message
    });
  }
});

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, (): void => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`📁 Upload directory: ${process.env.UPLOAD_PATH}`);
});

export default app;
