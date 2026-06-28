process.env.JWT_SECRET = "test-secret-for-jest";

jest.mock("@prisma/client", () => {
  const mockPrisma = { $connect: jest.fn(), $disconnect: jest.fn() };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("../src/config/db", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const productRoutes = require("../src/routes/product.routes");
const errorHandler = require("../src/middleware/errorHandler");
const { prisma } = require("../src/config/db");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/products", productRoutes);
  app.use(errorHandler);
  return app;
}

function adminToken() {
  return jwt.sign({ sub: "admin-1", role: "ADMIN" }, "test-secret-for-jest", { expiresIn: "1h" });
}

describe("Product Routes", () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
  });

  describe("GET /api/products", () => {
    it("should return paginated products", async () => {
      prisma.product.findMany.mockResolvedValue([{ id: "p1", name: "Item" }]);
      prisma.product.count.mockResolvedValue(1);

      const res = await request(app).get("/api/products");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it("should filter by search query", async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      const res = await request(app).get("/api/products?search=shoe");

      expect(res.status).toBe(200);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: "shoe" }) }),
            ]),
          }),
        })
      );
    });

    it("should include inactive products when includeInactive=true with admin auth", async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await request(app)
        .get("/api/products?includeInactive=true")
        .set("Authorization", `Bearer ${adminToken()}`);

      const call = prisma.product.findMany.mock.calls[0][0];
      expect(call.where.isActive).toBeUndefined();
    });

    it("should return 403 when non-admin uses includeInactive=true", async () => {
      const customerToken = jwt.sign({ sub: "user-1", role: "CUSTOMER" }, "test-secret-for-jest", { expiresIn: "1h" });
      prisma.user.findUnique.mockResolvedValue({ id: "user-1", role: "CUSTOMER" });

      const res = await request(app)
        .get("/api/products?includeInactive=true")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/products/:slug", () => {
    it("should return a product by slug", async () => {
      prisma.product.findFirst.mockResolvedValue({ id: "p1", slug: "test-product", name: "Test" });

      const res = await request(app).get("/api/products/test-product");

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe("test-product");
    });

    it("should return 404 when product not found", async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      const res = await request(app).get("/api/products/missing");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/products", () => {
    it("should return 401 without auth", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({ name: "Test", price: 100 });

      expect(res.status).toBe(401);
    });

    it("should return 400 when name is missing", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ price: 100 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Name and price are required/);
    });

    it("should return 400 when price is negative", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Test", price: -5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/non-negative/);
    });

    it("should create product with unique slug", async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue({
        id: "p1", name: "Test Product", slug: "test-product", price: 100, stock: 0,
      });

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Test Product", price: 100 });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Test Product");
    });

    it("should append timestamp to slug if slug already exists", async () => {
      prisma.product.findUnique.mockResolvedValue({ id: "existing" });
      prisma.product.create.mockImplementation(({ data }) => {
        return Promise.resolve({ id: "p2", ...data });
      });

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Test Product", price: 50 });

      expect(res.status).toBe(201);
      const slug = prisma.product.create.mock.calls[0][0].data.slug;
      expect(slug).toMatch(/^test-product-\d+$/);
    });
  });

  describe("PUT /api/products/:id", () => {
    it("should return 404 when product does not exist", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put("/api/products/missing-id")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Updated" });

      expect(res.status).toBe(404);
    });

    it("should update product fields", async () => {
      prisma.product.findUnique.mockResolvedValue({ id: "p1", name: "Old" });
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.product.update.mockResolvedValue({ id: "p1", name: "New", price: 200 });

      const res = await request(app)
        .put("/api/products/p1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "New", price: 200 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("New");
    });

    it("should handle slug conflict on name change", async () => {
      prisma.product.findUnique.mockResolvedValue({ id: "p1", name: "Old" });
      prisma.product.findFirst.mockResolvedValue({ id: "p2", slug: "new-name" });
      prisma.product.update.mockImplementation(({ data }) => {
        return Promise.resolve({ id: "p1", ...data });
      });

      const res = await request(app)
        .put("/api/products/p1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(200);
      const slug = prisma.product.update.mock.calls[0][0].data.slug;
      expect(slug).toMatch(/^new-name-\d+$/);
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should return 404 when product does not exist", async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/products/missing-id")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });

    it("should delete and return 204", async () => {
      prisma.product.findUnique.mockResolvedValue({ id: "p1" });
      prisma.product.delete.mockResolvedValue({ id: "p1" });

      const res = await request(app)
        .delete("/api/products/p1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(204);
    });
  });
});
