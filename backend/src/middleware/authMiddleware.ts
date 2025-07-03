import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express'; // Express-Typen importieren
import User, { IUser } from '../models/User'; // IUser-Interface vom User-Modell importieren
import { getLogger } from './logs';

const logger = getLogger('AuthMiddleware');

// 1. Interface für das JWT-Payload definieren
interface JwtPayload {
  id: string; // Annahme: Dein Token-Payload enthält eine 'id'
}

// 2. Erweitern des Request-Interfaces, um 'user' hinzuzufügen
// Dies ermöglicht req.user.xyz in anderen Middlewares/Controllern
interface AuthenticatedRequest extends Request {
  user?: IUser; // Optional, da es erst nach erfolgreicher Authentifizierung gesetzt wird
}

const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined; // Token als String oder undefined typisieren

  // logger.info('Full Authorization Header: ', req.headers.authorization); // Kann viel Output erzeugen, evtl. nur im Debug-Modus

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token extrahieren
      token = req.headers.authorization.split(' ')[1];

      // logger.info('Received Token in protect middleware: ', token); // Nur im Debug-Modus protokollieren
      // JWT_SECRET sollte vor dem Start der Anwendung überprüft werden
      if (!process.env.JWT_SECRET) {
        logger.error('JWT_SECRET ist nicht gesetzt!');
        return res.status(500).json({ message: 'Serverkonfigurationsfehler: JWT-Secret fehlt' });
      }

      // Token verifizieren und Payload extrahieren
      // 'as JwtPayload' typisiert das Ergebnis von jwt.verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

      // Benutzer anhand der ID aus dem Token finden und Passwort ausschließen
      // Stelle sicher, dass User.findById ein Promise zurückgibt
      req.user = await User.findById(decoded.id).select('-password');

      // Wenn der Benutzer nicht gefunden wird, ist das Token ungültig oder der Benutzer existiert nicht mehr
      if (!req.user) {
        logger.warn(`User with ID ${decoded.id} not found after token verification.`);
        return res.status(401).json({ message: 'Not authorized, user not found for token.' });
      }

      // Weiter zur nächsten Middleware/Route
      next();

    } catch (error: any) { // 'error' hier typisieren
      logger.error('Fehler bei der Token-Verifizierung oder Benutzerabfrage:', error.message);
      // Gib einen generischeren Fehler für den Client zurück
      return res.status(401).json({ message: 'Nicht autorisiert, Token ist ungültig oder abgelaufen.' });
    }
  } else {
    // Wenn kein 'Bearer'-Token im Header gefunden wurde
    logger.warn('Kein "Bearer"-Token im Authorization-Header gefunden.');
    return res.status(401).json({ message: 'Nicht autorisiert, kein Token vorhanden.' });
  }
};

export { protect }; // Verwende 'export' statt 'module.exports' für ES Modules