import { Request, Response } from "express";
import { IUser } from "../../helpers/typescript-helpers/interfaces";
import UserModel from "./user.model";
import { uploadImage } from "../../helpers/function-helpers/multer-config";

export const getAllInfo = (req: Request, res: Response) => {
  const user = req.user;
  res.status(200).send({
    email: user?.email,
    firstName: user?.firstName,
    secondName: user?.secondName,
    phone: user?.phone,
    id: user?._id,
    calls: user?.calls,
    favourites: user?.favourites,
  });
};

export const getAllInfoById = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  res.status(200).send({
    email: user?.email,
    firstName: user?.firstName,
    secondName: user?.secondName,
    avatar: user?.avatarUrl,
    phone: user?.phone,
  });
};

export const uploadAvatar = async (req: Request, res: Response) => {
  const user = req.user;
  if (req.fileValidationError) {
    return res.status(400).send({ message: req.fileValidationError });
  }
  if (!req.file) {
    return res.status(400).send({ message: "Image required" });
  }
  const imageUrl = await uploadImage(req.file);
  (user as IUser).avatarUrl = imageUrl as string;
  await (user as IUser).save();
  return res.status(200).send({ avatarUrl: imageUrl });
};

export const getCreators = async (req: Request, res: Response) => {
  return res.status(200).send([
    {
      firstName: "Daniel",
      secondName: "Tsvirkun",
      tasks: "Team Lead | Header",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/cb3029e9-8667-480a-8646-4eadaa9bdeb6.jpg",
    },
    {
      firstName: "Andrew",
      secondName: "Oscolok",
      tasks: "Forma rejestracji, nasz zespół i ustawienia userbacka",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/4d4e8cc1-db9e-4713-b8e7-f559693969e4.jpg",
    },
    {
      firstName: "Iryna",
      secondName: "Lunova",
      tasks: "Karta ogłoszenia i wypełnienie bazy",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/5ce409e6-def8-4151-9e1f-3fafcec56410.jpg",
    },
    {
      firstName: "Andrii",
      secondName: "Kochmaruk",
      tasks: "Mój profil",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/2538fc90-8959-4a56-8865-9dde68b8c537.jpg",
    },
    {
      firstName: "Igor",
      secondName: "Serov",
      tasks: "Napisanie modułów pytań do ogłoszeń",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/d4996f0a-274f-459d-ab3a-fe0306fb4b50.jpg",
    },
    {
      firstName: "Oleksandr",
      secondName: "Tril",
      tasks: "Architektura BD",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/9d2f4b2a-e803-4fc4-ba6e-b10f0ce55d14.png",
    },
    {
      firstName: "Andrii",
      secondName: "Kyluk",
      tasks: "Reklama i pasek kategorii",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/2c94ba5c-6c13-4aa0-8e05-86eba65daa47.jpg",
    },
    {
      firstName: "Yurii",
      secondName: "Dubenyuk",
      tasks: "Stopka i okno modalne",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/1dd94074-cb6e-49c6-9a33-4c4345e6756c.jpg",
    },
    {
      firstName: "Ivan",
      secondName: "Shtypula",
      tasks: "Forma tworzenia ogłoszeń",
      avatar:
        "https://storage.googleapis.com/kidslikev2_bucket/c6705931-a616-4695-9fdf-17c6e9f6b936.jpg",
    },
  ]);
};

export const setDefaultAvatar = async (req: Request, res: Response) => {
  const user = req.user;
  (user as IUser).avatarUrl = "https://i.ibb.co/K7j3rZk/99-512.png";
  await user?.save();
  return res.status(200).end();
};
