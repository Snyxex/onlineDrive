import mongoose, { Schema, Document, Model } from "mongoose";


interface IFile extends Document {
    userId: mongoose.Types.ObjectId; 
    filename: string;
    data: Buffer;      
    mimetype: string; 
    size: number;      
    createdAt: Date;
    
}


const fileSchema = new Schema<IFile>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    filename: {
        type: String,
        required: true
    },
    data: {
        type: Buffer,
        required: true
    },
    mimetype: { 
        type: String,
        required: true
    },
    size: {     
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const File: Model<IFile> = mongoose.model<IFile>('File', fileSchema);

export default File;