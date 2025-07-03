import express, { Request, Response } from 'express'; 
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; 
import { protect } from '../middleware/authMiddleware'; 
import { getLogger } from '../middleware/logs'; 

const router = express.Router();
const logger = getLogger('AuthRoutes'); 


interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}


const generateToken = (id: string): string => { 
   
    if (!process.env.JWT_SECRET) {
        logger.error('Umgebungsvariable JWT_SECRET ist nicht gesetzt! Token-Generierung fehlgeschlagen.');
        throw new Error('Serverkonfigurationsfehler: JWT-Secret fehlt. Bitte Umgebungsvariable setzen.');
    }

    try {
       
        return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    } catch (error: any) {
      
        logger.error(`Fehler beim Generieren des Tokens für User ID ${id}: ${error.message}`, { stack: error.stack });
        throw new Error('Token konnte aufgrund eines internen Fehlers nicht generiert werden.');
    }
};

//register route
router.post('/register', async (req: any, res: any) => {
    const { username, email, password } = req.body;

    // Grundlegende Validierung der Eingabefelder (Prüfung auf Vorhandensein)
    if (!username || !email || !password) {
        logger.warn('Registrierungsversuch mit unvollständigen Daten.', {
            usernameProvided: !!username,
            emailProvided: !!email,
            passwordProvided: !!password
        });
        return res.status(400).json({ message: 'Bitte geben Sie Benutzername, E-Mail und Passwort an.' });
    }

    try {
        // Prüfen, ob ein Benutzer mit dieser E-Mail bereits existiert
        const userExists = await User.findOne({ email });

        if (userExists) {
            logger.info(`Registrierungsversuch abgelehnt: Benutzer existiert bereits für E-Mail: ${email}`);
            return res.status(400).json({ message: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.' });
        }
        
        // Benutzer erstellen (Mongoose pre('save') Middleware sollte das Passwort hashen)
        const user: IUser = await User.create({
           username,
           email,
           password
        });

        // Prüfen, ob der Benutzer erfolgreich erstellt wurde
        if (user && user._id) {
            logger.info(`Neuer Benutzer erfolgreich registriert: ${user.email} (ID: ${user._id})`);
            // Sende eine Erfolgsantwort mit Benutzerdaten und Token
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id.toString()), 
            });
        } else {
         
            logger.warn(`Registrierung fehlgeschlagen: Benutzer konnte nicht erstellt werden mit E-Mail: ${email}. Ungültige Daten?`);
            return res.status(400).json({ message: 'Ungültige Benutzerdaten für die Registrierung.' });
        }
    } catch (error: any) {
       
        logger.error(`Kritischer Registrierungsfehler für E-Mail ${email}: ${error.message}`, { stack: error.stack }); 
    
        res.status(500).json({ message: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.' });
    }
});
//login route
router.post('/login', async (req: any, res: any) => {
    const { email, password } = req.body;

    // 2. Grundlegende Validierung der Eingabefelder
    if (!email || !password) {
        logger.warn('Login-Versuch mit unvollständigen Daten.', { emailProvided: !!email, passwordProvided: !!password });
        return res.status(400).json({ message: 'Bitte geben Sie E-Mail und Passwort an.' });
    }

    try {
        // 3. Benutzer anhand der E-Mail finden
        const user = await User.findOne({ email });

        // 4. Prüfen, ob Benutzer existiert und Passwort übereinstimmt
        // Die user.matchPassword-Methode ist Teil deines Mongoose Schemas (IUser)
        if (user && user._id && (await user.matchPassword(password))) {
            logger.info(`Login erfolgreich für Benutzer: ${user.email} (ID: ${user._id})`);
            // Erfolgsantwort mit Benutzerdaten und Token
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                // 5. Token generieren und zurückgeben
                token: generateToken(user._id.toString()), // Konvertiere ObjectId zu String
            });
        } else {
            // 6. Fehler bei ungültigen Anmeldeinformationen
            logger.warn(`Login fehlgeschlagen für E-Mail: ${email} - Ungültige Anmeldeinformationen.`);
            res.status(401).json({ message: 'Ungültige E-Mail oder Passwort' });
        }
    } catch (error: any) {
        // 7. Serverfehler abfangen und protokollieren
        logger.error(`Login-Fehler für E-Mail ${email}: ${error.message}`, { stack: error.stack });
        // Generische Fehlermeldung für den Client
        res.status(500).json({ message: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.' });
    }
});


export default router;