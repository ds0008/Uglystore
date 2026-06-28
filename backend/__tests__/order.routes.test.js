process.env.JWT_SECRET = "test-secret-for-jest";

jest.mock("@prisma/client", () => {
  const mockPrisma = { $connect: jest.fn(), $disconnect: jest.fn() };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockTx = {
  product: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  order: { create: jest.fn() },
};

jest.mock("../src/config/db", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockTx)),
  },
}));

const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const orderRoutes = require("../src/routes/order.routes");
const errorHandler = require("../src/middleware/errorHandler");
const { prisma } = require("../src/config/db");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/orders", orderRoutes);
  app.use(errorHandler);
  return app;
}

function userToken(id = "user-1", role = "CUSTOMER") {
  return jwt.sign({ sub: id, role }, "test-secret-for-jest", { expiresIn: "1h" });
}

describe("Order Routes", () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", role: "CUSTOMER" });
  });

  describe("POST /api/orders", () => {
    it("should return 401 without auth", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ items: [{ productId: "p1", quantity: 1 }], paymentMethod: "CARD" });

      expect(res.status).toBe(401);
    });

    it("should return 400 when items is empty", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ items: [], paymentMethod: "CARD" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least one item/);
    });

    it("should return 400 when items is missing", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ paymentMethod: "CARD" });

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid paymentMethod", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ items: [{ productId: "p1", quantity: 1 }], paymentMethod: "BITCOIN" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/paymentMethod must be one of/);
    });

    it("should return 400 for invalid quantity", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ items: [{ productId: "p1", quantity: -1 }], paymentMethod: "CARD" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/positive integer/);
    });

    it("should return 400 when product not found", async () => {
      mockTx.product.findMany.mockResolvedValue([]);

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ items: [{ productId: "p1", quantity: 1 }], paymentMethod: "CARD" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/not found or inactive/);
    });

    it("should return 400 when stock is insufficient", async () => {
      mockTx.product.findMany.mockResolvedValue([
        { id: "p1", name: "Product 1", price: 500, stock: 0, isActive: true },
      ]);

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ items: [{ productId: "p1", quantity: 2 }], paymentMethod: "CARD" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Insufficient stock/);
    });

    it("should create order with free shipping when subtotal >= 1000", async () => {
      mockTx.product.findMany.mockResolvedValue([
        { id: "p1", name: "Expensive", price: 1500, stock: 10, isActive: true },
      ]);
      mockTx.product.update.mockResolvedValue({ id: "p1", stock: 9 });
      mockTx.order.create.mockResolvedValue({
        id: "order-1",
        subtotal: 1500,
        shippingCost: 0,
        totalAmount: 1500,
        items: [],
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ items: [{ productId: "p1", quantity: 1 }], paymentMethod: "CARD" });

      expect(res.status).toBe(201);
      expect(res.body.data.shippingCost).toBe(0);
    });

    it("should create order with shipping cost when subtotal < 1000", async () => {
      mockTx.product.findMany.mockResolvedValue([
        { id: "p1", name: "Cheap", price: 100, stock: 10, isActive: true },
      ]);
      mockTx.product.update.mockResolvedValue({ id: "p1", stock: 9 });
      mockTx.order.create.mockResolvedValue({
        id: "order-1",
        subtotal: 100,
        shippingCost: 60,
        totalAmount: 160,
        items: [],
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ items: [{ productId: "p1", quantity: 1 }], paymentMethod: "CASH_ON_DELIVERY" });

      expect(res.status).toBe(201);
    });
  });

  describe("GET /api/orders", () => {
    it("should return paginated orders for authenticated user", async () => {
      prisma.order.findMany.mockResolvedValue([{ id: "o1" }]);
      prisma.order.count.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it("should show all orders for ADMIN", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken("admin-1", "ADMIN")}`);

      expect(res.status).toBe(200);
      const where = prisma.order.findMany.mock.calls[0][0].where;
      expect(where).toEqual({});
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should return 404 when order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/orders/missing")
        .set("Authorization", `Bearer ${userToken()}`);

      expect(res.status).toBe(404);
    });

    it("should return 403 when user tries to view another user's order", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: "o1", userId: "other-user" });

      const res = await request(app)
        .get("/api/orders/o1")
        .set("Authorization", `Bearer ${userToken()}`);

      expect(res.status).toBe(403);
    });

    it("should return order for owner", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: "o1", userId: "user-1" });

      const res = await request(app)
        .get("/api/orders/o1")
        .set("Authorization", `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe("o1");
    });

    it("should allow ADMIN to view any order", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
      prisma.order.findUnique.mockResolvedValue({ id: "o1", userId: "other-user" });

      const res = await request(app)
        .get("/api/orders/o1")
        .set("Authorization", `Bearer ${userToken("admin-1", "ADMIN")}`);

      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("should return 401 without auth", async () => {
      const res = await request(app)
        .patch("/api/orders/o1/status")
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(401);
    });

    it("should return 403 for non-admin", async () => {
      const res = await request(app)
        .patch("/api/orders/o1/status")
        .set("Authorization", `Bearer ${userToken()}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(403);
    });

    it("should return 400 for invalid status", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "admin-1", role: "ADMIN" });

      const res = await request(app)
        .patch("/api/orders/o1/status")
        .set("Authorization", `Bearer ${userToken("admin-1", "ADMIN")}`)
        .send({ status: "INVALID" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Status must be one of/);
    });

    it("should return 404 when order not found", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
      prisma.order.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .patch("/api/orders/o1/status")
        .set("Authorization", `Bearer ${userToken("admin-1", "ADMIN")}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(404);
    });

    it("should update order status", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
      prisma.order.findUnique.mockResolvedValue({ id: "o1", status: "PENDING" });
      prisma.order.update.mockResolvedValue({ id: "o1", status: "SHIPPED" });

      const res = await request(app)
        .patch("/api/orders/o1/status")
        .set("Authorization", `Bearer ${userToken("admin-1", "ADMIN")}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("SHIPPED");
    });
  });
});
