//dependencies
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { getLogger } from './src/middleware/logs';
import { connectDB } from './src/db/DBconnect';

//routes
import authRoutes from './src/routes/authRoutes';

// Lade Umgebungsvariablen so früh wie möglich
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const logger = getLogger('Server');

logger.info('Starte Server-Initialisierung...');

// --- Wichtige Middleware ---
// 1. JSON Body Parser: Muss vor allen Routen stehen, die JSON-Bodies erwarten
app.use(express.json()); 
logger.info('JSON Body Parser middleware initialisiert.');

// 2. CORS-Konfiguration: Muss vor Routen stehen, um CORS-Header zu setzen
const whitelist = ['http://localhost:5173']; 
const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Erlaube Anfragen ohne Origin (z.B. Postman, Curl, gleiche Herkunft)
    if (whitelist.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
      logger.info(`CORS erlaubt für Origin: ${origin || 'undefined (kein Origin-Header)'}`);
    } else {
      logger.warn(`CORS Block: Ungültiger Origin "${origin}"`);
      callback(new Error('Nicht erlaubt durch CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Erlaube das Senden von Cookies/Auth-Headern
  optionsSuccessStatus: 204 // Status für preflight requests
};
app.use(cors(corsOptions));
logger.info('CORS middleware initialisiert.');

// 3. Datenbankverbindung: Asynchron aufrufen, aber App kann weiterlaufen (Mongoose managed Reconnects)
connectDB(); 

// --- Custom Logging / Test-Middleware ---
app.use((req, res, next) => {
  logger.info(`Anfrage empfangen: ${req.method} ${req.url}`, { method: req.method, url: req.url, ip: req.ip });
  next();
});
app.use((req, res, next) => {
  logger.info('Middleware-Kette fortgesetzt nach CORS.');
  next();
});

// --- Routen ---
app.use('/api/auth', authRoutes);
logger.info('Auth-Routen initialisiert unter /api/auth.');

app.get('/', (req, res) => {
  res.send('Hello from API Server!');
  logger.info(`Root-Endpunkt aufgerufen.`);
});

// --- Globaler Error Handler ---
app.use((err: any, req: express.Request, res: any, next: express.NextFunction) => {
  logger.error('Globaler Error-Handler: Fehler abgefangen:', { message: err.message, stack: err.stack, name: err.name });

  if (err.message === 'Nicht erlaubt durch CORS') {
      return res.status(403).json({ message: 'Zugriff nicht erlaubt aufgrund von CORS-Richtlinien.' });
  }

  if (err.name === 'CastError' || err.name === 'ValidationError' || (err.code && err.code === 11000)) {
      return res.status(400).json({ message: `Datenbank-Validierungsfehler: ${err.message}` });
  }

  if (err.message === 'Serverkonfigurationsfehler: JWT-Secret fehlt.' || err.message === 'Token konnte aufgrund eines internen Fehlers nicht generiert werden.') {
      return res.status(500).json({ message: 'Authentifizierungsservice vorübergehend nicht verfügbar.' });
  }

  res.status(err.status || 500).json({ message: 'Ein unerwarteter Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.' });
});
logger.info('Globaler Error Handler initialisiert.');

// --- Server starten ---
app.listen(port, () => {
  console.log(`🚀 Server läuft auf http://localhost:${port}`);
  logger.info(`Server erfolgreich gestartet auf Port ${port}.`, { port });
});