// controllers/fileController.ts
import { Request, Response, NextFunction } from "express"; // Importiere NextFunction
import File from "../model/File"; // Achte auf korrekte Groß-/Kleinschreibung des Dateinamens (File.ts oder file.ts)
import { getLogger } from "../common/logs";
import mongoose from "mongoose";

const logger = getLogger("FileController");

// Typ-Erweiterung für die Request, um `req.file` und `req.user` zu unterstützen
declare module 'express' {
    export interface Request {
        file?: Express.Multer.File;
        user?: { _id: string; role: string };
    }
}

/**
 * @route POST /api/upload
 * @description Lädt eine Datei hoch und speichert sie in MongoDB.
 * @access Private (Benötigt Authentifizierung)
 */
export async function uploadFile(request: Request, response: Response): Promise<void> { // Explizit Promise<void>
    try {
        if (!request.file) {
            logger.warn("No file provided for upload.");
            response.status(400).json({ message: "No file provided" });
            return; // Wichtig: Beende die Funktion hier
        }

        if (!request.user || !request.user._id) {
            logger.error("User not authenticated for file upload.");
            response.status(401).json({ message: "User not authenticated" });
            return; // Wichtig: Beende die Funktion hier
        }

        const { originalname, buffer, mimetype, size } = request.file;
        const userId = new mongoose.Types.ObjectId(request.user._id);

        const newFile = new File({
            userId: userId,
            filename: originalname,
            data: buffer,
            mimetype: mimetype,
            size: size,
        });

        const savedFile = await newFile.save();
        logger.info(`File uploaded successfully for user ${request.user._id}: ${originalname}`);

        response.status(201).json({
            message: "File uploaded successfully",
            file: {
                _id: savedFile._id,
                filename: savedFile.filename,
                size: savedFile.size,
                mimetype: savedFile.mimetype,
                createdAt: savedFile.createdAt,
                userId: savedFile.userId.toString() // Füge userId hinzu für die Übersicht
            },
        });

    } catch (error: any) {
        logger.error("Error during file upload:", error);
        response.status(500).json({
            message: "Error uploading file",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

// ----------------------------------------------------------------------------------------------------

/**
 * @route GET /api/files
 * @description Ruft eine Liste aller Dateien (oder spezifischer Benutzerdateien) ab.
 * @access Private (Benötigt Authentifizierung)
 * @param {Request} request - Express Request Objekt. Kann Query-Parameter für Paginierung/Filterung enthalten.
 * @param {Response} response - Express Response Objekt.
 * @returns {Promise<void>}
 */
export async function getAllFiles(request: Request, response: Response): Promise<void> {
    try {
        if (!request.user || !request.user._id) {
            logger.error("User not authenticated for fetching files.");
            response.status(401).json({ message: "User not authenticated" });
            return;
        }

        const userId = request.user._id;
        const userRole = request.user.role;

        // Optional: Paginierungsparameter aus der Anfrage lesen
        const page = parseInt(request.query.page as string) || 1;
        const limit = parseInt(request.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        let query: any = {}; // MongoDB Query-Objekt

        // Wenn der Benutzer KEIN Admin ist, soll er nur seine eigenen Dateien sehen
        if (userRole !== "admin") {
            query.userId = new mongoose.Types.ObjectId(userId); // Filter nach der Benutzer-ID
        }

        const fileList = await File.find(query)
            .skip(skip)
            .limit(limit)
            .select('-data'); // Das 'data'-Feld (der eigentliche Dateiinhalt) NICHT senden
                               // Es sei denn, du hast kleine Vorschaubilder oder ähnliches

        const totalFiles = await File.countDocuments(query); // Gesamtzahl der Dateien für Paginierung
        const totalPages = Math.ceil(totalFiles / limit); // Gesamtzahl der Seiten

        logger.info(`Fetching files for user ${userId} (role: ${userRole}). Page ${page}, Limit ${limit}. Total: ${totalFiles}`);

        response.status(200).json({
            message: "List of available files",
            files: fileList.map(file => ({ // Nur notwendige Metadaten zurückgeben
                _id: file._id.toString(),
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                createdAt: file.createdAt,
                userId: file.userId.toString() // Optional: userId auch hier anzeigen
            })),
            currentPage: page,
            totalPages: totalPages,
            totalFiles: totalFiles,
        });

    } catch (error: any) {
        logger.error("Error fetching file list:", error);
        response.status(500).json({
            message: "Error retrieving file list",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function getFile(request: Request, response: Response): Promise<void> {
    try {
        const fileId = request.params.id;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            logger.warn(`Invalid file ID format: ${fileId}`);
            response.status(400).json({ message: "Invalid file ID" });
            return;
        }

        const file = await File.findById(fileId);

        if (!file) {
            logger.warn(`File not found with ID: ${fileId}`);
            response.status(404).json({ message: "File not found" });
            return;
        }

        if (request.user?.role !== "admin" && file.userId.toString() !== request.user?._id) {
            logger.warn(`User ${request.user?._id} tried to access file ${fileId} without permission.`);
            response.status(403).json({ message: "Access denied. You do not own this file." });
            return;
        }

        // --- Start of the fix ---
        // Encode the filename to handle special characters (like umlauts)
        const encodedFilename = encodeURIComponent(file.filename);
        // Use the encoded filename in Content-Disposition, and specify UTF-8 for better compatibility
        response.setHeader('Content-Type', file.mimetype);
        response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
        // --- End of the fix ---

        response.setHeader('Content-Length', file.size.toString());

        logger.info(`Serving file ${file.filename} (ID: ${fileId}) to user ${request.user?._id}.`);
        response.send(file.data);

    } catch (error: any) {
        logger.error("Error retrieving file:", error);
        response.status(500).json({
            message: "Error retrieving file",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * @route DELETE /api/file/:id
 * @description Löscht eine Datei nach ihrer ID.
 * @access Private (Benötigt Authentifizierung und Berechtigung)
 */
export async function deleteFile(request: Request, response: Response): Promise<void> { // Explizit Promise<void>
    try {
        const fileId = request.params.id;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            logger.warn(`Invalid file ID format for deletion: ${fileId}`);
            response.status(400).json({ message: "Invalid file ID" });
            return;
        }

        const file = await File.findById(fileId);

        if (!file) {
            logger.warn(`File not found for deletion with ID: ${fileId}`);
            response.status(404).json({ message: "File not found" });
            return;
        }

        if (request.user?.role !== "admin" && file.userId.toString() !== request.user?._id) {
            logger.warn(`User ${request.user?._id} tried to delete file ${fileId} without permission.`);
            response.status(403).json({ message: "Access denied. You do not own this file." });
            return;
        }

        await File.deleteOne({ _id: fileId });
        logger.info(`File ${fileId} deleted successfully by user ${request.user?._id}.`);

        response.status(200).json({ message: "File deleted successfully" });

    } catch (error: any) {
        logger.error("Error deleting file:", error);
        response.status(500).json({
            message: "Error deleting file",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}