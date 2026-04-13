import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import testcaseRoutes, { setTestCaseService } from './routes/testcaseRoutes';
import GroqService from './services/groqService';
import TestCaseService from './services/testCaseService';

dotenv.config();

const app = express();

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
const portString: string = process.env.PORT || '3001';
const portNum = parseInt(portString, 10);
const PORT: number = isNaN(portNum) ? 3001 : portNum;

if (PORT < 1 || PORT > 65535) {
  throw new Error(`Invalid PORT: ${PORT}. Must be between 1 and 65535`);
}

const hostname: string = '0.0.0.0';
const callback = () => {
  console.log(`✓ Test Case Generation Agent v1.0.0`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ LLM Provider: Groq`);
  console.log(`✓ LLM Model: ${process.env.GROQ_MODEL}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ API Base: http://localhost:${PORT}/api/testcases`);
};

// @ts-ignore - Type inference issue with Express listen() overload resolution
app.listen(PORT, hostname, callback);
