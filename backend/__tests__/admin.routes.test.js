process.env.JWT_SECRET = "test-secret-for-jest";

jest.mock("@prisma/client", () => {
  const mockPrisma = { $connect: jest.fn(), $disconnect: jest.fn() };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("../src/config/db", () => ({
  prisma: {
    user: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), count: jest.fn() },
    product: { count: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    order: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), aggregate: jest.fn(), groupBy: jest.fn() },
    orderItem: { groupBy: jest.fn() },
    category: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    inventoryLog: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    warehouse: { findMany: jest.fn(), create: jest.fn() },
    coupon: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    invoice: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), count: jest.fn() },
    orderTimeline: { findMany: jest.fn(), create: jest.fn() },
    refund: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    shippingZone: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    courier: { findMany: jest.fn(), create: jest.fn() },
    banner: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    campaign: { findMany: jest.fn(), create: jest.fn() },
    flashSale: { findMany: jest.fn(), create: jest.fn() },
    transaction: { findMany: jest.fn(), count: jest.fn() },
    setting: { findMany: jest.fn(), upsert: jest.fn() },
    activityLog: { findMany: jest.fn(), count: jest.fn() },
    giftCard: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    supportTicket: { findMany: jest.fn(), update: jest.fn(), count: jest.fn() },
  },
}));

const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const adminRoutes = require("../src/routes/admin.routes");
const errorHandler = require("../src/middleware/errorHandler");
const { prisma } = require("../src/config/db");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRoutes);
  app.use(errorHandler);
  return app;
}

function adminToken() {
  return jwt.sign({ sub: "admin-1", role: "ADMIN" }, "test-secret-for-jest", { expiresIn: "1h" });
}

function customerToken() {
  return jwt.sign({ sub: "user-1", role: "CUSTOMER" }, "test-secret-for-jest", { expiresIn: "1h" });
}

describe("Admin Routes", () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
  });

  describe("authentication & authorization", () => {
    it("should return 401 without auth header", async () => {
      const res = await request(app).get("/api/admin/stats");
      expect(res.status).toBe(401);
    });

    it("should return 403 for non-admin users", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "user-1", role: "CUSTOMER" });
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${customerToken()}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/stats", () => {
    it("should return dashboard statistics", async () => {
      prisma.product.count.mockResolvedValue(10);
      prisma.order.count.mockResolvedValue(5);
      prisma.user.count.mockResolvedValue(20);
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 5000 } });
      prisma.product.findMany.mockResolvedValue([]);
      prisma.order.groupBy.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);
      prisma.orderItem.groupBy.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProducts).toBe(10);
      expect(res.body.data.totalOrders).toBe(5);
      expect(res.body.data.totalUsers).toBe(20);
    });
  });

  describe("User Management", () => {
    describe("GET /api/admin/users", () => {
      it("should return paginated users", async () => {
        prisma.user.findMany.mockResolvedValue([{ id: "u1", email: "a@b.com" }]);
        prisma.user.count.mockResolvedValue(1);

        const res = await request(app)
          .get("/api/admin/users")
          .set("Authorization", `Bearer ${adminToken()}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.pagination).toBeDefined();
      });

      it("should filter by search query", async () => {
        prisma.user.findMany.mockResolvedValue([]);
        prisma.user.count.mockResolvedValue(0);

        await request(app)
          .get("/api/admin/users?search=test")
          .set("Authorization", `Bearer ${adminToken()}`);

        const call = prisma.user.findMany.mock.calls[0][0];
        expect(call.where.OR).toBeDefined();
      });

      it("should filter by role", async () => {
        prisma.user.findMany.mockResolvedValue([]);
        prisma.user.count.mockResolvedValue(0);

        await request(app)
          .get("/api/admin/users?role=ADMIN")
          .set("Authorization", `Bearer ${adminToken()}`);

        const call = prisma.user.findMany.mock.calls[0][0];
        expect(call.where.role).toBe("ADMIN");
      });
    });

    describe("PATCH /api/admin/users/:id/role", () => {
      it("should return 400 for invalid role", async () => {
        const res = await request(app)
          .patch("/api/admin/users/u1/role")
          .set("Authorization", `Bearer ${adminToken()}`)
          .send({ role: "SUPERADMIN" });

        expect(res.status).toBe(400);
      });

      it("should return 404 when user not found", async () => {
        prisma.user.findUnique
          .mockResolvedValueOnce({ id: "admin-1", role: "ADMIN" })
          .mockResolvedValueOnce(null);

        const res = await request(app)
          .patch("/api/admin/users/missing/role")
          .set("Authorization", `Bearer ${adminToken()}`)
          .send({ role: "ADMIN" });

        expect(res.status).toBe(404);
      });

      it("should return 400 when trying to change own role", async () => {
        prisma.user.findUnique
          .mockResolvedValueOnce({ id: "admin-1", role: "ADMIN" })
          .mockResolvedValueOnce({ id: "admin-1", role: "ADMIN" });

        const res = await request(app)
          .patch("/api/admin/users/admin-1/role")
          .set("Authorization", `Bearer ${adminToken()}`)
          .send({ role: "CUSTOMER" });

        expect(res.status).toBe(400);
      });

      it("should update user role", async () => {
        prisma.user.findUnique
          .mockResolvedValueOnce({ id: "admin-1", role: "ADMIN" })
          .mockResolvedValueOnce({ id: "u2", role: "CUSTOMER" });
        prisma.user.update.mockResolvedValue({ id: "u2", role: "ADMIN" });

        const res = await request(app)
          .patch("/api/admin/users/u2/role")
          .set("Authorization", `Bearer ${adminToken()}`)
          .send({ role: "ADMIN" });

        expect(res.status).toBe(200);
        expect(res.body.data.role).toBe("ADMIN");
      });
    });
  });

  describe("Category Management", () => {
    it("GET /api/admin/categories should return categories", async () => {
      prisma.category.findMany.mockResolvedValue([{ id: "c1", name: "Electronics" }]);

      const res = await request(app)
        .get("/api/admin/categories")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/categories should create a category", async () => {
      prisma.category.create.mockResolvedValue({ id: "c1", name: "Shoes", slug: "shoes" });

      const res = await request(app)
        .post("/api/admin/categories")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Shoes" });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/categories returns 400 without name", async () => {
      const res = await request(app)
        .post("/api/admin/categories")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("PUT /api/admin/categories/:id should update a category", async () => {
      prisma.category.update.mockResolvedValue({ id: "c1", name: "Updated" });

      const res = await request(app)
        .put("/api/admin/categories/c1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Updated" });

      expect(res.status).toBe(200);
    });

    it("DELETE /api/admin/categories/:id should delete", async () => {
      prisma.category.delete.mockResolvedValue({ id: "c1" });

      const res = await request(app)
        .delete("/api/admin/categories/c1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(204);
    });
  });

  describe("Inventory Management", () => {
    it("GET /api/admin/inventory should return logs", async () => {
      prisma.inventoryLog.findMany.mockResolvedValue([]);
      prisma.inventoryLog.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/admin/inventory")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/inventory should create a log and update stock", async () => {
      prisma.inventoryLog.create.mockResolvedValue({ id: "log1" });
      prisma.product.update.mockResolvedValue({ id: "p1", stock: 15 });

      const res = await request(app)
        .post("/api/admin/inventory")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ productId: "p1", type: "STOCK_IN", quantity: 10 });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/inventory returns 400 without required fields", async () => {
      const res = await request(app)
        .post("/api/admin/inventory")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ productId: "p1" });

      expect(res.status).toBe(400);
    });

    it("GET /api/admin/warehouses should return warehouses", async () => {
      prisma.warehouse.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/admin/warehouses")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/warehouses should create a warehouse", async () => {
      prisma.warehouse.create.mockResolvedValue({ id: "w1", name: "Main" });

      const res = await request(app)
        .post("/api/admin/warehouses")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Main", location: "Dhaka" });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/warehouses returns 400 without required fields", async () => {
      const res = await request(app)
        .post("/api/admin/warehouses")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Main" });

      expect(res.status).toBe(400);
    });
  });

  describe("Coupon Management", () => {
    it("GET /api/admin/coupons should return paginated coupons", async () => {
      prisma.coupon.findMany.mockResolvedValue([]);
      prisma.coupon.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/admin/coupons")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/coupons should create a coupon", async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);
      prisma.coupon.create.mockResolvedValue({ id: "cp1", code: "SAVE10" });

      const res = await request(app)
        .post("/api/admin/coupons")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({
          code: "save10",
          type: "PERCENTAGE",
          value: 10,
          startDate: "2025-01-01",
          endDate: "2025-12-31",
        });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/coupons returns 400 without required fields", async () => {
      const res = await request(app)
        .post("/api/admin/coupons")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ code: "X" });

      expect(res.status).toBe(400);
    });

    it("POST /api/admin/coupons returns 409 for duplicate code", async () => {
      prisma.coupon.findUnique.mockResolvedValue({ id: "existing" });

      const res = await request(app)
        .post("/api/admin/coupons")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({
          code: "EXISTING",
          type: "FIXED",
          value: 50,
          startDate: "2025-01-01",
          endDate: "2025-12-31",
        });

      expect(res.status).toBe(409);
    });

    it("PUT /api/admin/coupons/:id should update", async () => {
      prisma.coupon.update.mockResolvedValue({ id: "cp1", isActive: false });

      const res = await request(app)
        .put("/api/admin/coupons/cp1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
    });

    it("DELETE /api/admin/coupons/:id should delete", async () => {
      prisma.coupon.delete.mockResolvedValue({ id: "cp1" });

      const res = await request(app)
        .delete("/api/admin/coupons/cp1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(204);
    });
  });

  describe("Invoice Management", () => {
    it("GET /api/admin/invoices should return paginated invoices", async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/admin/invoices")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/invoices/:orderId should create an invoice", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: "o1", subtotal: 1000, discount: 0, shippingCost: 60, tax: 0, totalAmount: 1060, items: [],
      });
      prisma.invoice.findUnique.mockResolvedValue(null);
      prisma.invoice.count.mockResolvedValue(5);
      prisma.invoice.create.mockResolvedValue({ id: "inv1", invoiceNumber: "INV-000006" });

      const res = await request(app)
        .post("/api/admin/invoices/o1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/invoices/:orderId returns 404 when order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/admin/invoices/missing")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });

    it("POST /api/admin/invoices/:orderId returns 409 for duplicate invoice", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: "o1", items: [] });
      prisma.invoice.findUnique.mockResolvedValue({ id: "existing" });

      const res = await request(app)
        .post("/api/admin/invoices/o1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(409);
    });
  });

  describe("Order Timeline & Refund", () => {
    it("GET /api/admin/orders/:id/timeline should return timeline", async () => {
      prisma.orderTimeline.findMany.mockResolvedValue([{ id: "t1", status: "PENDING" }]);

      const res = await request(app)
        .get("/api/admin/orders/o1/timeline")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/orders/:id/refund should process refund", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: "o1" });
      prisma.refund.create.mockResolvedValue({ id: "r1", amount: 500 });
      prisma.order.update.mockResolvedValue({ id: "o1" });
      prisma.orderTimeline.create.mockResolvedValue({ id: "t1" });

      const res = await request(app)
        .post("/api/admin/orders/o1/refund")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ amount: 500, reason: "Damaged" });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/orders/:id/refund returns 404 when order not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/admin/orders/missing/refund")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ amount: 100 });

      expect(res.status).toBe(404);
    });

    it("POST /api/admin/orders/:id/refund returns 400 for invalid amount", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: "o1" });

      const res = await request(app)
        .post("/api/admin/orders/o1/refund")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ amount: -10 });

      expect(res.status).toBe(400);
    });
  });

  describe("Shipping Management", () => {
    it("GET /api/admin/shipping/zones should return zones", async () => {
      prisma.shippingZone.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/admin/shipping/zones")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/shipping/zones should create a zone", async () => {
      prisma.shippingZone.create.mockResolvedValue({ id: "z1", name: "Dhaka" });

      const res = await request(app)
        .post("/api/admin/shipping/zones")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Dhaka", rate: 60 });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/shipping/zones returns 400 without required fields", async () => {
      const res = await request(app)
        .post("/api/admin/shipping/zones")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Zone" });

      expect(res.status).toBe(400);
    });

    it("PUT /api/admin/shipping/zones/:id should update", async () => {
      prisma.shippingZone.update.mockResolvedValue({ id: "z1", rate: 80 });

      const res = await request(app)
        .put("/api/admin/shipping/zones/z1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ rate: 80 });

      expect(res.status).toBe(200);
    });

    it("GET /api/admin/shipping/couriers should return couriers", async () => {
      prisma.courier.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/admin/shipping/couriers")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/shipping/couriers should create a courier", async () => {
      prisma.courier.create.mockResolvedValue({ id: "cr1", name: "DHL" });

      const res = await request(app)
        .post("/api/admin/shipping/couriers")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "DHL" });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/shipping/couriers returns 400 without name", async () => {
      const res = await request(app)
        .post("/api/admin/shipping/couriers")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("Marketing", () => {
    it("GET /api/admin/banners should return banners", async () => {
      prisma.banner.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/admin/banners")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/banners should create a banner", async () => {
      prisma.banner.create.mockResolvedValue({ id: "b1", title: "Sale" });

      const res = await request(app)
        .post("/api/admin/banners")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ title: "Sale", image: "sale.png" });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/banners returns 400 without required fields", async () => {
      const res = await request(app)
        .post("/api/admin/banners")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ title: "Sale" });

      expect(res.status).toBe(400);
    });

    it("PUT /api/admin/banners/:id should update", async () => {
      prisma.banner.update.mockResolvedValue({ id: "b1", isActive: false });

      const res = await request(app)
        .put("/api/admin/banners/b1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
    });

    it("DELETE /api/admin/banners/:id should delete", async () => {
      prisma.banner.delete.mockResolvedValue({ id: "b1" });

      const res = await request(app)
        .delete("/api/admin/banners/b1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(204);
    });

    it("GET /api/admin/campaigns should return campaigns", async () => {
      prisma.campaign.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/admin/campaigns")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/campaigns should create a campaign", async () => {
      prisma.campaign.create.mockResolvedValue({ id: "camp1", name: "Summer" });

      const res = await request(app)
        .post("/api/admin/campaigns")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Summer", type: "EMAIL" });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/campaigns returns 400 without required fields", async () => {
      const res = await request(app)
        .post("/api/admin/campaigns")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Summer" });

      expect(res.status).toBe(400);
    });

    it("GET /api/admin/flash-sales should return flash sales", async () => {
      prisma.flashSale.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/admin/flash-sales")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/flash-sales should create a flash sale", async () => {
      prisma.flashSale.create.mockResolvedValue({ id: "fs1", name: "Flash" });

      const res = await request(app)
        .post("/api/admin/flash-sales")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Flash", discount: 20, startDate: "2025-01-01", endDate: "2025-01-02" });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/flash-sales returns 400 without required fields", async () => {
      const res = await request(app)
        .post("/api/admin/flash-sales")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "Flash" });

      expect(res.status).toBe(400);
    });
  });

  describe("Transactions & Refunds", () => {
    it("GET /api/admin/transactions should return paginated transactions", async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/admin/transactions")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("GET /api/admin/refunds should return paginated refunds", async () => {
      prisma.refund.findMany.mockResolvedValue([]);
      prisma.refund.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/admin/refunds")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });
  });

  describe("Reports", () => {
    it("GET /api/admin/reports/sales should return sales report", async () => {
      prisma.order.findMany.mockResolvedValue([
        { totalAmount: 500, createdAt: new Date("2025-06-01") },
        { totalAmount: 300, createdAt: new Date("2025-06-01") },
      ]);

      const res = await request(app)
        .get("/api/admin/reports/sales?period=30")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalOrders).toBe(2);
      expect(res.body.data.totalRevenue).toBe(800);
    });

    it("GET /api/admin/reports/products should return product report", async () => {
      prisma.orderItem.groupBy.mockResolvedValue([
        { productId: "p1", _sum: { quantity: 10, totalPrice: 5000 } },
      ]);
      prisma.product.findMany.mockResolvedValue([{ id: "p1", name: "Bestseller" }]);

      const res = await request(app)
        .get("/api/admin/reports/products")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].totalSold).toBe(10);
    });
  });

  describe("Settings", () => {
    it("GET /api/admin/settings should return settings map", async () => {
      prisma.setting.findMany.mockResolvedValue([
        { key: "site_name", value: "Uglystore" },
      ]);

      const res = await request(app)
        .get("/api/admin/settings")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.site_name).toBe("Uglystore");
    });

    it("GET /api/admin/settings should filter by group", async () => {
      prisma.setting.findMany.mockResolvedValue([]);

      await request(app)
        .get("/api/admin/settings?group=payment")
        .set("Authorization", `Bearer ${adminToken()}`);

      const call = prisma.setting.findMany.mock.calls[0][0];
      expect(call.where.group).toBe("payment");
    });

    it("PUT /api/admin/settings should update settings", async () => {
      prisma.setting.upsert.mockResolvedValue({});

      const res = await request(app)
        .put("/api/admin/settings")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ settings: { site_name: "New Name" } });

      expect(res.status).toBe(200);
    });

    it("PUT /api/admin/settings returns 400 without settings object", async () => {
      const res = await request(app)
        .put("/api/admin/settings")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("Activity Log", () => {
    it("GET /api/admin/activity should return paginated logs", async () => {
      prisma.activityLog.findMany.mockResolvedValue([]);
      prisma.activityLog.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/admin/activity")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });
  });

  describe("Gift Cards", () => {
    it("GET /api/admin/gift-cards should return paginated cards", async () => {
      prisma.giftCard.findMany.mockResolvedValue([]);
      prisma.giftCard.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/admin/gift-cards")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("POST /api/admin/gift-cards should create a gift card", async () => {
      prisma.giftCard.create.mockResolvedValue({ id: "gc1", balance: 500 });

      const res = await request(app)
        .post("/api/admin/gift-cards")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ balance: 500 });

      expect(res.status).toBe(201);
    });

    it("POST /api/admin/gift-cards returns 400 without balance", async () => {
      const res = await request(app)
        .post("/api/admin/gift-cards")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("Support Tickets", () => {
    it("GET /api/admin/tickets should return paginated tickets", async () => {
      prisma.supportTicket.findMany.mockResolvedValue([]);
      prisma.supportTicket.count.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/admin/tickets")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it("GET /api/admin/tickets should filter by status", async () => {
      prisma.supportTicket.findMany.mockResolvedValue([]);
      prisma.supportTicket.count.mockResolvedValue(0);

      await request(app)
        .get("/api/admin/tickets?status=OPEN")
        .set("Authorization", `Bearer ${adminToken()}`);

      const call = prisma.supportTicket.findMany.mock.calls[0][0];
      expect(call.where.status).toBe("OPEN");
    });

    it("PATCH /api/admin/tickets/:id should update ticket", async () => {
      prisma.supportTicket.update.mockResolvedValue({ id: "t1", status: "RESOLVED" });

      const res = await request(app)
        .patch("/api/admin/tickets/t1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ status: "RESOLVED" });

      expect(res.status).toBe(200);
    });
  });
});
