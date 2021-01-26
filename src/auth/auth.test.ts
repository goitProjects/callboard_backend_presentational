import { Application } from "express";
import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import jwt from "jsonwebtoken";
import Server from "../server/server";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import { IUser, ISession } from "../helpers/typescript-helpers/interfaces";

describe("Auth router test suite", () => {
  let app: Application;
  let createdUser: IUser | null;
  let createdSession: ISession | null;
  let token: string;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/auth`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: "test@email.com" });
    await mongoose.connection.close();
  });

  describe("POST /auth/register", () => {
    let response: Response;

    const validReqBody = {
      email: "test@email.com",
      password: "qwerty123",
      phone: "+380000000000",
      firstName: "Test",
      secondName: "Test",
    };

    const invalidReqBody = {
      email: "test@email.com",
      phone: "+380000000000",
      firstName: "Test",
      secondName: "Test",
    };

    const secondInvalidReqBody = {
      email: "test@email.com",
      password: "qwerty123",
      phone: "+380000000000",
      firstName: "Test",
      secondName: "Test",
      extra: {},
    };

    const thirdInvalidReqBody = {
      email: "test@email.com",
      phone: "+380000000000",
      firstName: "Test",
      secondName: "Test",
      password: {},
    };

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register")
          .send(validReqBody);
        createdUser = await UserModel.findOne({
          email: validReqBody.email,
        }).lean();
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          email: validReqBody.email,
          firstName: validReqBody.firstName,
          secondName: validReqBody.secondName,
          phone: validReqBody.phone,
          id: (createdUser as IUser)._id.toString(),
        });
      });

      it("Should create a new user in DB", () => {
        expect(createdUser).toBeTruthy();
      });

      it("Should create a right user in DB", () => {
        expect(createdUser).toEqual({
          email: validReqBody.email,
          passwordHash: (createdUser as IUser).passwordHash,
          favourites: [],
          calls: [],
          firstName: validReqBody.firstName,
          secondName: validReqBody.secondName,
          phone: validReqBody.phone,
          _id: (createdUser as IUser)._id,
          __v: 0,
        });
      });
    });

    context("With invalidReqBody (no 'password' provided)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register")
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'password' is required", () => {
        expect(response.body.message).toBe('"password" is required');
      });
    });

    context("With secondInvalidReqBody (extra field provided)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register")
          .send(secondInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'extra' is not allowed", () => {
        expect(response.body.message).toBe('"extra" is not allowed');
      });
    });

    context("With thirdInvalidReqBody ('password' has the wrong type)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register")
          .send(thirdInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'password' is required", () => {
        expect(response.body.message).toBe('"password" must be a string');
      });
    });

    context("With the same email", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/register")
          .send(validReqBody);
      });

      it("Should return a 409 status code", () => {
        expect(response.status).toBe(409);
      });

      it("Should say that user with this email already exists", () => {
        expect(response.body.message).toBe(
          `User with ${validReqBody.email} email already exists`
        );
      });
    });
  });

  describe("POST /auth/login", () => {
    let response: Response;

    const validReqBody = { email: "test@email.com", password: "qwerty123" };

    const invalidReqBody = { email: "test@email.com" };

    const secondInvalidReqBody = {
      email: "test@email.com",
      password: "qwerty123",
      extra: {},
    };

    const thirdInvalidReqBody = { email: "test@email.com", password: {} };

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app).post("/auth/login").send(validReqBody);
        createdSession = await SessionModel.findOne({
          uid: (createdUser as IUser)._id,
        });
        token = response.body.token;
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          token: response.body.token,
          user: {
            email: validReqBody.email,
            favourites: [],
            calls: [],
            firstName: "Test",
            secondName: "Test",
            phone: "+380000000000",
            id: (createdUser as IUser)._id.toString(),
          },
        });
      });

      it("Should create valid 'token'", () => {
        expect(
          jwt.verify(response.body.token, process.env.JWT_SECRET as string)
        ).toBeTruthy();
      });

      it("Should create a new session in DB", () => {
        expect(createdSession).toBeTruthy();
      });
    });

    context("With invalidReqBody (no 'password' provided)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/login")
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'password' is required", () => {
        expect(response.body.message).toBe('"password" is required');
      });
    });

    context("With secondInvalidReqBody (extra field provided)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/login")
          .send(secondInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'extra' is not allowed", () => {
        expect(response.body.message).toBe('"extra" is not allowed');
      });
    });

    context("With thirdInvalidReqBody ('password' is not a string)", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/login")
          .send(thirdInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that 'password' must be a string", () => {
        expect(response.body.message).toBe('"password" must be a string');
      });
    });
  });

  describe("POST /auth/logout", () => {
    let response: Response;
    let deletedSession: ISession | null;

    context("Valid request", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/auth/logout")
          .set("Authorization", `Bearer ${token}`);
        deletedSession = await SessionModel.findOne({
          uid: (createdUser as IUser)._id,
        });
      });

      it("Should return a 204 status code", () => {
        expect(response.status).toBe(204);
      });

      it("Should delete a session from DB", () => {
        expect(deletedSession).toBeFalsy();
      });
    });

    context("Without providing 'token'", () => {
      beforeAll(async () => {
        response = await supertest(app).post("/auth/logout");
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
          .post("/auth/logout")
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
});
