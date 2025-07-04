//dependencies
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { getLogger } from './src/common/logs';
import connectToMongo from "./src/DB/db";

//routes
import fileRoutes from './src/routes/fileRoutes';
import authRoutes from "./src/routes/user";

// Load environment variables as early as possible
connectToMongo();
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const logger = getLogger('Server');

logger.info('Starting server initialization...');

// --- Important Middleware ---
// 1. JSON Body Parser: Must be before all routes that expect JSON bodies
app.use(express.json()); 
logger.info('JSON Body Parser middleware initialized.');

// 2. CORS Configuration: Must be before routes to set CORS headers
const whitelist = ['http://localhost:5173']; 
const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests without origin (e.g., Postman, Curl, same origin)
    if (whitelist.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
      logger.info(`CORS allowed for Origin: ${origin || 'undefined (no Origin header)'}`);
    } else {
      logger.warn(`CORS Block: Invalid Origin "${origin}"`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow sending cookies/Auth headers
  optionsSuccessStatus: 204 // Status for preflight requests
};
app.use(cors(corsOptions));
logger.info('CORS middleware initialized.');

// --- Custom Logging / Test Middleware ---
app.use((req, res, next) => {
  logger.info(`Request received: ${req.method} ${req.url}`, { method: req.method, url: req.url, ip: req.ip });
  next();
});
app.use((req, res, next) => {
  logger.info('Middleware chain continued after CORS.');
  next();
});

// --- Routes ---
logger.info('Routes initialized under /api.');
app.use("/api", authRoutes);
app.use('/api', fileRoutes);

app.get('/', (req, res) => {
  res.send('Hello from API Server!');
  logger.info(`Root endpoint called.`);
});

// --- Global Error Handler ---
app.use((err: any, req: express.Request, res: any, next: express.NextFunction) => {
  logger.error('Global Error Handler: Error caught:', { message: err.message, stack: err.stack, name: err.name });

  if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ message: 'Access not allowed due to CORS policies.' });
  }

  if (err.name === 'CastError' || err.name === 'ValidationError' || (err.code && err.code === 11000)) {
      return res.status(400).json({ message: `Database validation error: ${err.message}` });
  }

  if (err.message === 'Server configuration error: JWT secret is missing.' || err.message === 'Token could not be generated due to an internal error.') {
      return res.status(500).json({ message: 'Authentication service temporarily unavailable.' });
  }

  res.status(err.status || 500).json({ message: 'An unexpected server error occurred. Please try again later.' });
});
logger.info('Global Error Handler initialized.');

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  logger.info(`Server successfully started on port ${port}.`, { port });
});