import path from "path";
import { Application } from "express";
import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import Server from "../../server/server";
import UserModel from "../user/user.model";
import SessionModel from "../session/session.model";
import { IUser } from "../../helpers/typescript-helpers/interfaces";

describe("User router test suite", () => {
  let app: Application;
  let createdUser: IUser | null;
  let response: Response;
  let token: string;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/user`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await supertest(app).post("/auth/register").send({
      email: "test@email.com",
      password: "qwerty123",
      firstName: "Test",
      secondName: "Test",
      phone: "+380000000000",
    });
    response = await supertest(app)
      .post("/auth/login")
      .send({ email: "test@email.com", password: "qwerty123" });
    token = response.body.token;
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: response.body.user.email });
    await SessionModel.deleteOne({ uid: response.body.user.id });
    await mongoose.connection.close();
  });

  describe("GET /user", () => {
    let response: Response;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/user")
          .set("Authorization", `Bearer ${token}`);
        createdUser = await UserModel.findOne({
          email: "test@email.com",
        }).lean();
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          email: (createdUser as IUser).email,
          firstName: (createdUser as IUser).firstName,
          secondName: (createdUser as IUser).secondName,
          phone: (createdUser as IUser).phone,
          id: (createdUser as IUser)._id.toString(),
          calls: (createdUser as IUser).calls,
          favourites: (createdUser as IUser).favourites,
        });
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app).get("/user");
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/user")
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });

  describe("GET /user/{userId}", () => {
    let response: Response;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app).get(
          `/user/${(createdUser as IUser)._id}`
        );
        createdUser = await UserModel.findOne({
          email: "test@email.com",
        }).lean();
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          email: (createdUser as IUser).email,
          firstName: (createdUser as IUser).firstName,
          secondName: (createdUser as IUser).secondName,
          phone: (createdUser as IUser).phone,
        });
      });
    });

    context("With invalid 'userId'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/user/qwerty123")
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'userId' is invalid", () => {
        expect(response.body.message).toBe(
          "Invalid 'userId'. Must be a MongoDB ObjectId"
        );
      });
    });
  });

  describe("PATCH /user/avatar", () => {
    let response: Response;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/user/avatar`)
          .set("Authorization", `Bearer ${token}`)
          .attach("file", path.join(__dirname, "../call/test-files/test.jpg"));
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          avatarUrl: response.body.avatarUrl,
        });
      });

      it("Should create a valid avatar URL", () => {
        expect(response.body.avatarUrl).toBeTruthy();
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/user/avatar`)
          .attach("file", path.join(__dirname, "../call/test-files/test.jpg"));
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .patch(`/user/avatar`)
          .set("Authorization", `Bearer qwerty123`)
          .attach("file", path.join(__dirname, "../call/test-files/test.jpg"));
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });

  describe("GET /user/creators", () => {
    let response: Response;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app).get(`/user/creators`);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual([
          {
            firstName: "Даня",
            secondName: "Цвиркун",
            tasks: "Team Lead | Header",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/cb3029e9-8667-480a-8646-4eadaa9bdeb6.jpg",
          },
          {
            firstName: "Андрей",
            secondName: "Осколок",
            tasks: "Форма входа, наша команда и юзер бэк",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/4d4e8cc1-db9e-4713-b8e7-f559693969e4.jpg",
          },
          {
            firstName: "Iryna",
            secondName: "Lunova",
            tasks: "Карточка объявления и наполнение базы",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/5ce409e6-def8-4151-9e1f-3fafcec56410.jpg",
          },
          {
            firstName: "Andrii",
            secondName: "Kochmaruk",
            tasks: "Мой кабинет",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/2538fc90-8959-4a56-8865-9dde68b8c537.jpg",
          },
          {
            firstName: "Игорь",
            secondName: "Серов",
            tasks: "Подключение модулей к бэку объявлений",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/d4996f0a-274f-459d-ab3a-fe0306fb4b50.jpg",
          },
          {
            firstName: "Oleksandr",
            secondName: "Tril",
            tasks: "Бэкенд объявлений",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/9d2f4b2a-e803-4fc4-ba6e-b10f0ce55d14.png",
          },
          {
            firstName: "Андрій",
            secondName: "Кулик",
            tasks: "Реклама и слайдеры категорий",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/2c94ba5c-6c13-4aa0-8e05-86eba65daa47.jpg",
          },
          {
            firstName: "Юрій",
            secondName: "Дубенюк",
            tasks: "Футер и модальное окно",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/1dd94074-cb6e-49c6-9a33-4c4345e6756c.jpg",
          },
          {
            firstName: "Ivan",
            secondName: "Shtypula",
            tasks: "Форма создания объявлений",
            avatar:
              "https://storage.googleapis.com/kidslikev2_bucket/c6705931-a616-4695-9fdf-17c6e9f6b936.jpg",
          },
        ]);
      });
    });
  });
});
