import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type Role = 'LEARNER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  avatarUrl?: string;
  status: UserStatus;
  emailVerified: boolean;
  /** Bcrypt hash of the 6-digit OTP — never store raw */
  otpCode?: string;
  /** Hard expiry timestamp (3 min after issue) */
  otpExpires?: Date;
  /** Failed OTP attempt counter — lock account after 5 */
  otpAttempts?: number;
  resetToken?: string;
  resetTokenExp?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['LEARNER', 'ADMIN'], default: 'LEARNER' },
    avatarUrl: { type: String },
    status: { type: String, enum: ['ACTIVE', 'BLOCKED', 'PENDING'], default: 'ACTIVE' },
    emailVerified: { type: Boolean, default: false },
    otpCode:     { type: String, select: false },
    otpExpires:  { type: Date,   select: false },
    otpAttempts: { type: Number, select: false, default: 0 },
    resetToken:    { type: String, select: false },
    resetTokenExp: { type: Date,   select: false },
  },
  { timestamps: true }
);

// Never expose sensitive fields in JSON responses
userSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: unknown, ret: Record<string, any>) {
    delete ret['passwordHash'];
    delete ret['otpCode'];
    delete ret['otpExpires'];
    delete ret['otpAttempts'];
    delete ret['resetToken'];
    delete ret['resetTokenExp'];
    return ret;
  },
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
