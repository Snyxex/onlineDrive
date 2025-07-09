// services/fileRoutes.ts
import express from "express";
// Import getAllFiles along with your other controllers
import { uploadFile, getFile, deleteFile, getAllFiles } from "../controllers/file"; // <-- Make sure getAllFiles is imported
import { requireSignin } from "../common/user";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 
        
    }
 });

// Route to upload a single file
router.post("/upload", requireSignin, upload.single("file"), uploadFile);


router.get("/files", requireSignin, getAllFiles); 

// Route to get a single file by ID
router.get("/file/:id", requireSignin, getFile);

// Route to delete a single file by ID
router.delete("/file/:id", requireSignin, deleteFile);

export default router;