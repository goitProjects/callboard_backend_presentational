import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import {
  ISession,
  IJWTPayload,
} from "../helpers/typescript-helpers/interfaces";

export const register = async (req: Request, res: Response) => {
  const { email, password, phone, firstName, secondName } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .send({ message: `User with ${email} email already exists` });
  }
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.HASH_POWER)
  );
  const newUser = await UserModel.create({
    email,
    passwordHash,
    phone,
    firstName,
    secondName,
    avatarUrl: "https://i.ibb.co/K7j3rZk/99-512.png",
    favourites: [],
    calls: [],
  });
  return res.status(201).send({
    email,
    phone,
    firstName,
    secondName,
    id: newUser._id,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res
      .status(403)
      .send({ message: `User with ${email} email doesn't exist` });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res.status(403).send({ message: "Password is wrong" });
  }
  const newSession = await SessionModel.create({
    uid: user._id,
  });
  const token = jwt.sign(
    { uid: user._id, sid: newSession._id },
    process.env.JWT_SECRET as string
  );
  return res.status(200).send({
    token,
    user: {
      email: user.email,
      firstName: user.firstName,
      secondName: user.secondName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      id: user._id,
      favourites: user.favourites,
      calls: user.calls,
    },
  });
};

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const token = authorizationHeader.replace("Bearer ", "");
    let payload: string | object;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await UserModel.findById((payload as IJWTPayload).uid);
    const session = await SessionModel.findById((payload as IJWTPayload).sid);
    if (!user) {
      return res.status(404).send({ message: "Invalid user" });
    }
    if (!session) {
      return res.status(404).send({ message: "Invalid session" });
    }
    req.user = user;
    req.session = session;
    next();
  } else return res.status(400).send({ message: "No token provided" });
};

export const logout = async (req: Request, res: Response) => {
  const currentSession = req.session;
  await SessionModel.deleteOne({ _id: (currentSession as ISession)._id });
  req.user = null;
  req.session = null;
  return res.status(204).end();
};
