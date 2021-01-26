import { Router } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import validate from "../helpers/function-helpers/validate";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import { register, login, authorize, logout } from "./auth.controller";

const signUpSchema = Joi.object({
  email: Joi.string().required(),
  firstName: Joi.string().required(),
  secondName: Joi.string().required(),
  phone: Joi.string().required(),
  password: Joi.string().required(),
});

const signInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const router = Router();

router.post("/register", validate(signUpSchema), tryCatchWrapper(register));
router.post("/login", validate(signInSchema), tryCatchWrapper(login));
router.post("/logout", tryCatchWrapper(authorize), tryCatchWrapper(logout));

export default router;
