process.env.JWT_SECRET = "test-secret-for-jest";

jest.mock("@prisma/client", () => {
  const mockPrisma = { $connect: jest.fn(), $disconnect: jest.fn() };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("../src/config/db", () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn() },
  },
}));

const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRoutes = require("../src/routes/auth.routes");
const errorHandler = require("../src/middleware/errorHandler");
const { prisma } = require("../src/config/db");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use(errorHandler);
  return app;
}

describe("Auth Routes", () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "a@b.com" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Email, password, and fullName are required/);
    });

    it("should return 400 when password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "a@b.com", password: "short", fullName: "Test" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 8 characters/);
    });

    it("should return 409 when email already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "existing" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "a@b.com", password: "longpassword", fullName: "Test" });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already registered/);
    });

    it("should return 201 with user and token on success", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: "user-1",
        email: "a@b.com",
        fullName: "Test User",
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
      };
      prisma.user.create.mockResolvedValue(createdUser);

      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "a@b.com", password: "longpassword", fullName: "Test User" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 when email or password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "a@b.com" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Email and password are required/);
    });

    it("should return 401 when user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "missing@b.com", password: "whatever123" });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid email or password/);
    });

    it("should return 401 when password is wrong", async () => {
      const hash = await bcrypt.hash("correctpassword", 4);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        passwordHash: hash,
        fullName: "Test",
        role: "CUSTOMER",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "a@b.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
    });

    it("should return 200 with user and token on valid credentials", async () => {
      const hash = await bcrypt.hash("correctpass", 4);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        passwordHash: hash,
        fullName: "Test",
        role: "CUSTOMER",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "a@b.com", password: "correctpass" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe("user-1");
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 401 without auth header", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("should return current user on valid token", async () => {
      const user = {
        id: "user-1",
        email: "a@b.com",
        fullName: "Test",
        role: "CUSTOMER",
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      prisma.user.findUnique.mockResolvedValue(user);
      const token = jwt.sign({ sub: "user-1", role: "CUSTOMER" }, "test-secret-for-jest", { expiresIn: "1h" });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("a@b.com");
    });
  });
});
