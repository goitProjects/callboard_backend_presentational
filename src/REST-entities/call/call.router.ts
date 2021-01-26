import { Router } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import { authorize } from "../../auth/auth.controller";
import tryCatchWrapper from "../../helpers/function-helpers/try-catch-wrapper";
import validate from "../../helpers/function-helpers/validate";
import {
  postCall,
  addToFavourites,
  removeFromFavourites,
  deleteCall,
  loadPages,
  getFavourites,
  getCalls,
  searchCalls,
  getRussianCategories,
  getCategories,
  getCategory,
  getAds,
} from "./call.controller";
import { multerMid } from "../../helpers/function-helpers/multer-config";
import { Categories } from "../../helpers/typescript-helpers/enums";

const postCallSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string()
    .required()
    .valid(
      Categories.BUSINESS_AND_SERVICES,
      Categories.ELECTRONICS,
      Categories.FREE,
      Categories.PROPERTY,
      Categories.RECREATION_AND_SPORT,
      Categories.TRADE,
      Categories.TRANSPORT,
      Categories.WORK
    ),
  price: Joi.number().required().min(0),
});

const callIdSchema = Joi.object({
  callId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'callId'. Must be a MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const getCallsSchema = Joi.object({
  page: Joi.number().required().min(1).max(3),
});

const searchCallsSchema = Joi.object({
  search: Joi.string().required(),
});

const router = Router();

router.post(
  "/",
  tryCatchWrapper(authorize),
  multerMid.array("file"),
  validate(postCallSchema),
  tryCatchWrapper(postCall)
);
router.post(
  "/favourite/:callId",
  tryCatchWrapper(authorize),
  validate(callIdSchema, "params"),
  tryCatchWrapper(addToFavourites)
);
router.delete(
  "/favourite/:callId",
  tryCatchWrapper(authorize),
  validate(callIdSchema, "params"),
  tryCatchWrapper(removeFromFavourites)
);
router.delete(
  "/:callId",
  tryCatchWrapper(authorize),
  validate(callIdSchema, "params"),
  tryCatchWrapper(deleteCall)
);
router.get("/", validate(getCallsSchema, "query"), tryCatchWrapper(loadPages));
router.get("/own", tryCatchWrapper(authorize), tryCatchWrapper(getCalls));
router.get(
  "/favourites",
  tryCatchWrapper(authorize),
  tryCatchWrapper(getFavourites)
);
router.get(
  "/find",
  validate(searchCallsSchema, "query"),
  tryCatchWrapper(searchCalls)
);
router.get("/categories", tryCatchWrapper(getCategories));
router.get("/russian-categories", tryCatchWrapper(getRussianCategories));
router.get("/specific/:category", tryCatchWrapper(getCategory));
router.get("/ads", tryCatchWrapper(getAds));

export default router;
