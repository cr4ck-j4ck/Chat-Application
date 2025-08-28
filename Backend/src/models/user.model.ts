import mongoose, { Document, Schema, model } from 'mongoose';

/** 🔑 Enum for Login Provider */
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
}

/** 🧠 Interface for User document */
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  provider: AuthProvider;
  password?: string; // optional for social login
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  friends: mongoose.Types.ObjectId[]; // References to other users
  blockedUsers: mongoose.Types.ObjectId[];
  socketId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 🧱 User Schema Definition */
const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    avatar: {
      type: String,
      default: '', // or default avatar URL
    },

    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.EMAIL
    },

    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === AuthProvider.EMAIL;
      },
    },

    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    socketId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

/** 🚀 User Model */
const User = model<IUser>('User', UserSchema);
export default User;
