import mongoose, { Schema } from "mongoose";
import { callSchema } from "../call/call.model";
import { IUser } from "../../helpers/typescript-helpers/interfaces";

const userSchema = new Schema({
  email: String,
  firstName: String,
  secondName: String,
  passwordHash: String,
  calls: [callSchema],
  favourites: [callSchema],
  avatarUrl: String,
  phone: String,
});

export default mongoose.model<IUser>("User", userSchema);
