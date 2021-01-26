import { Document } from "mongoose";
import { MongoDBObjectId } from "./types";

export interface IUser extends Document {
  email: string;
  firstName: string;
  secondName: string;
  passwordHash: string;
  calls: ICall[];
  favourites: ICall[];
  avatarUrl: String;
  phone: String;
}

export interface ISession extends Document {
  uid: MongoDBObjectId;
}

export interface IJWTPayload {
  uid: MongoDBObjectId;
  sid: MongoDBObjectId;
}

export interface ICall extends Document {
  title: string;
  imageUrls: string[];
  description: string;
  category: string;
  price: number;
  userId: string;
}
