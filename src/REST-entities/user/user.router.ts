import { Router } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import { authorize } from "./../../auth/auth.controller";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import {
  getAllInfo,
  getAllInfoById,
  uploadAvatar,
  getCreators,
} from "./user.controller";
import validate from "../../helpers/function-helpers/validate";
import { multerMid } from "../../helpers/function-helpers/multer-config";

const router = Router();

const userIdSchema = Joi.object({
  userId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'userId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

router.get("/", tryCatchWrapper(authorize), tryCatchWrapper(getAllInfo));
router.get("/creators", tryCatchWrapper(getCreators));
router.get(
  "/:userId",
  validate(userIdSchema, "params"),
  tryCatchWrapper(getAllInfoById)
);
router.patch(
  "/avatar",
  multerMid.single("file"),
  tryCatchWrapper(authorize),
  tryCatchWrapper(uploadAvatar)
);

export default router;
