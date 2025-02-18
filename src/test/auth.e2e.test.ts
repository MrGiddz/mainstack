import request from "supertest";
import mongoose from "mongoose";
import app, { closeServer } from "../index";
import UserModel from "../models/user.model";
import { HttpStatusCode } from "axios";

let testUser = {
  username: "user",
  email: "email@example.com",
  password: "password",
};

let authToken: string;
let refreshToken: string;
let otp: string;

describe("Auth End-to-End Tests", () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.DATABASE_URL!);
  });

  afterAll(async () => {
    // Cleanup
    await UserModel.deleteMany({});
    await mongoose.connection.close();
    await closeServer();
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(HttpStatusCode.Created);
    expect(res.body.user).toHaveProperty("email", testUser.email);
  });

  it("should not register a duplicate user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(HttpStatusCode.Conflict);
    expect(res.body.message).toBe("Account already exists");
  });

  it("should login successfully", async () => {
    const loginData = {
      username: testUser.username,
      password: testUser.password,
    };
    const res = await request(app).post("/api/auth/login").send(loginData);
    expect(res.status).toBe(HttpStatusCode.Created);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");

    authToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("should fail to login with incorrect password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: testUser.username,
      password: "wrongpassword",
    });

    expect(response.status).toBe(HttpStatusCode.Unauthorized);
  });

  it("should request a password reset", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({ email: testUser.email });

    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.body.message).toBe("Password reset email sent.");

    const user = await UserModel.findOne({ email: testUser.email });
    expect(user?.auth.resetPasswordOTP).toBeDefined();
    otp = user?.auth.resetPasswordOTP!;
  });

  it("should verify OTP and allow password reset", async () => {
    const res = await request(app)
      .post("/api/auth/verify-password-reset")
      .send({ email: testUser.email, otp });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("OTP verified successfully.");
  });

  it("should fail to request password reset for non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({ email: "nonexistent@example.com" });

    expect(res.status).toBe(HttpStatusCode.NotFound);
  });
});
