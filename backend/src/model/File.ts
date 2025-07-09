// model/File.ts
import mongoose, { Schema, HydratedDocument, Model, Types } from "mongoose";

// 1. Define the core interface for your document's properties.
export interface IFile {
    userId: Types.ObjectId;
    filename: string;
    data: Buffer; // <-- Das Datei-Buffer-Feld ist wieder da
    mimetype: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Define the Document type.
export interface IFileDocument extends HydratedDocument<IFile> {
    _id: Types.ObjectId;
}

// 3. Define the Model type.
interface IFileModel extends Model<IFileDocument> {
    // Fügen Sie hier bei Bedarf statische Methoden hinzu
}

// 4. Define the Schema.
const fileSchema = new Schema<IFileDocument, IFileModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User' // Referenz zu Ihrem User-Modell
        },
        filename: {
            type: String,
            required: true
        },
        data: {
            type: Buffer, // <-- Speichert den Dateiinhalt direkt
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true // Fügt automatisch createdAt und updatedAt hinzu
    }
);

// 5. Create the Mongoose Model.
const File = mongoose.model<IFileDocument, IFileModel>('File', fileSchema);

export default File;