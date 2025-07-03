import express from 'express';
import dotenv from 'dotenv';
import {getLogger} from './src/middleware/logs';
import { connectDB } from './src/db/DBconnect';
import cors from 'cors';


dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const logger = getLogger('Server');

connectDB();

logger.info('start middleware Initialization');

//Test-middleware
app.use((req, res, next) =>{
  logger.info(`Request received: ${req.method} ${req.url}`, { method: req.method, url: req.url });
  next();
});

app.use(express.json());
logger.info('JSON middleware initialized');

//Cors Config
const whitelist = ['http://localhost:5173']; 
const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (whitelist.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
      logger.info(`CORS allowed for origin: ${origin}`);
    } else {
      logger.warn(`CORS Block: Ungültiger Origin "${origin}"`);
      callback(new Error('Nicht erlaubt durch CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
logger.info('CORS middleware initialized');

// test-middleware after cors 
app.use((req,res,next) => {
  logger.info('CORS middleware passed, continuing to next middleware');
  next();
});
// routes



app.get('/', (req, res) => {
  res.send('Hello from API Server!');
  logger.info(`Root endpoint hit`);
});



app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
  logger.info(`Server started on port ${port}`, { port });
});

