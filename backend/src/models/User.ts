import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface IUser extends Document {
  username: string;
  email: string;
  password: string; // Das gehashte Passwort
  createdAt: Date;
  updatedAt: Date;
  
  matchPassword(enteredPassword: string): Promise<boolean>;
  updatePassword(newPassword: string): Promise<void>;
}

const userSchema = new Schema<IUser>({ 
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});


userSchema.pre('save', async function (next) {

  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) { 
    next(error);
  }
});


userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {

  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.methods.updatePassword = async function (newPassword: string): Promise<void> {
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(newPassword, salt);
        await this.save(); 
    } catch (error: any) {
        throw new Error('Fehler beim Aktualisieren des Passworts: ' + error.message);
    }
};


const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;