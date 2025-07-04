import express, { Request, Response } from 'express';
import multer from 'multer';
import File from '../model/File';
import { getLogger } from '../common/logs';
import asyncHandler from '../utils/asyncHandler';
import { requireSignin } from '../common/user';

const logger = getLogger('FileRoutes');
const router = express.Router();

// Set up storage for uploaded files
const storage = multer.memoryStorage(); // Use memory storage for MongoDB
const upload = multer({ storage });

// @route   POST /api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', requireSignin, upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Keine Datei hochgeladen' });
    }

    const userId = req.user ? req.user._id : null;

    const newFile = new File({
        userId,
        filename: req.file.originalname,
        data: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
    });

    const savedFile = await newFile.save();
    res.status(201).json(savedFile);
}));

// @route   GET /api/files
// @desc    Get all files for the authenticated user
// @access  Private
router.get('/', requireSignin, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user ? req.user._id : null;
    const files = await File.find({ userId });
    res.json(files);
}));

// @route   GET /api/files/:id
// @desc    Download a file
// @access  Private
router.get('/:id', requireSignin, asyncHandler(async (req: Request, res: Response) => {
    const file = await File.findById(req.params.id);

    if (!file) {
        return res.status(404).json({ message: 'Datei nicht gefunden' });
    }

    const userId = req.user ? req.user._id : null;
    if (!userId || file.userId.toString() !== userId.toString()) {
        return res.status(401).json({ message: 'Nicht autorisiert, Sie sind nicht der Eigentümer dieser Datei' });
    }

    res.set('Content-Type', file.mimetype);
    res.set('Content-Disposition', `attachment; filename=${file.filename}`);
    res.send(file.data);
}));

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', requireSignin, asyncHandler(async (req: Request, res: Response) => {
    const file = await File.findById(req.params.id);

    if (!file) {
        return res.status(404).json({ message: 'Datei nicht gefunden' });
    }

    const userId = req.user ? req.user._id : null;
    if (!userId || file.userId.toString() !== userId.toString()) {
        return res.status(401).json({ message: 'Nicht autorisiert, Sie sind nicht der Eigentümer dieser Datei' });
    }

    await file.deleteOne();
    res.json({ message: 'Datei entfernt' });
}));

export default router; 