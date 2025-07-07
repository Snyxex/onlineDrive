import mongoose, { Schema, HydratedDocument, Model, Types } from "mongoose";

// 1. Define the core interface for your document's properties.
// This interface represents the "plain" data shape of your document.
export interface IFile {
    userId: Types.ObjectId;
    filename: string;
    data: Buffer;
    mimetype: string;
    size: number;
    // createdAt and updatedAt are handled by timestamps: true,
    // but good to include in the interface for type safety.
    createdAt: Date;
    updatedAt: Date; // Not optional, as timestamps: true makes it required
}

// 2. Define the Document type, which is the hydrated Mongoose document.
// This type automatically includes _id and Mongoose's document methods.
// We explicitly define _id here for clarity, though HydratedDocument often infers it.
export interface IFileDocument extends HydratedDocument<IFile> {
    _id: Types.ObjectId; // Explicitly define _id as ObjectId
}

// 3. Define the Model type, including any custom static methods.
// The Model type will work with IFileDocument.
interface IFileModel extends Model<IFileDocument> {
    // You can add static methods here, e.g.:
    // findFilesByUserId(userId: string): Promise<IFileDocument[]>;
}

// 4. Define the Schema, explicitly typing it with IFileDocument and IFileModel.
const fileSchema = new Schema<IFileDocument, IFileModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User' // Reference to your User model
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
        }
    },
    {
        timestamps: true // This will automatically add createdAt and updatedAt fields
    }
);

// 5. Create the Mongoose Model.
// The first generic argument is the Document type (IFileDocument).
// The second generic argument is the Model type (IFileModel).
const File = mongoose.model<IFileDocument, IFileModel>('File', fileSchema);

export default File;