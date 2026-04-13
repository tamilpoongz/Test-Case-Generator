import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import testcaseRoutes, { setTestCaseService } from './routes/testcaseRoutes';
import GroqService from './services/groqService';
import TestCaseService from './services/testCaseService';

dotenv.config();

const app = express();

// Get port from environment or use default
function getAppPort(): number {
  const envPort = process.env.PORT;
  if (envPort && !isNaN(parseInt(envPort, 10))) {
    return parseInt(envPort, 10);
  }
  return 3001;
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000']
}));

// Initialize services
const groqService = new GroqService(
  process.env.GROQ_API_KEY || '',
  process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
);
const testCaseService = new TestCaseService(groqService);
setTestCaseService(testCaseService);

// Routes
app.use('/api/testcases', testcaseRoutes);

// Health route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Test Case Generation Agent',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT: number = getAppPort();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Test Case Generation Agent v1.0.0`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ LLM Provider: Groq`);
  console.log(`✓ LLM Model: ${process.env.GROQ_MODEL}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ API Base: http://localhost:${PORT}/api/testcases`);
});
