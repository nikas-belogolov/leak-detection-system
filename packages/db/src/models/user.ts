import { Schema, Types } from "mongoose"
import mongoose from "mongoose"

import type { IDevice } from "./device.js";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  devices: string[];
}

const schema = new Schema<IUser>({
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required."],
    validate: [
      {
        validator: async (value: string) => {
          const user = await mongoose.models.User?.exists({ email: value });
          return !user; // Return false if email is already in use
        },
        message: 'Email is already in use.'
      },
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minLength: [8, 'Password must be at least 8 characters long.'],
    maxLength: [64, 'Password must be at most 64 characters long.']
  },
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }]
})

schema.set('validateBeforeSave', false);

export const User = mongoose.models.User as mongoose.Model<IUser> || mongoose.model<IUser>("User", schema);
