import mongoose, { Schema } from "mongoose";
import { ICall } from "../../helpers/typescript-helpers/interfaces";

export const callSchema = new Schema({
  title: String,
  imageUrls: [String],
  description: String,
  category: String,
  price: Number,
  userId: mongoose.Types.ObjectId,
});

export default mongoose.model<ICall>("Call", callSchema);
