import mongoose from 'mongoose';
import { getLogger } from '../middleware/logs'; // Pfad zu deinem Logger anpassen

const logger = getLogger('Database');
const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/drive?authSource=admin'; // Standardwert für MONGO_URI

// Event Listener für Mongoose-Verbindungen
mongoose.connection.on('connected', () => {
  logger.info('Mongoose: Standardverbindung hergestellt.');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose: Standardverbindungsfehler:', err.message);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose: Standardverbindung getrennt.');
});

// Wenn der Prozess beendet wird, schließe die Mongoose-Verbindung
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose: Standardverbindung durch App-Beendigung geschlossen.');
  process.exit(0);
});

export async function connectDB() {
  try {
    // Wenn Sie Mongoose 6.x oder höher verwenden, sind die meisten Optionen standardmäßig eingestellt
    // und müssen nicht explizit übergeben werden, es sei denn, Sie möchten sie ändern.
    await mongoose.connect(MONGO_URI);
    // Hier ist kein logger.info nötig, da der 'connected'-Event dies bereits tut
  } catch (err: any) {
    console.error('Fehler bei der Verbindung zur Datenbank:', err);
    logger.error('Mongoose: Initialer Verbindungsfehler:', err.message);
    process.exit(1); // Anwendung beenden, wenn die initiale Verbindung fehlschlägt
  }
}

