process.env.JWT_SECRET = "test-secret-for-jest";

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("../src/config/db", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  },
}));

const jwt = require("jsonwebtoken");
const { authenticate, requireAdmin, generateToken } = require("../src/middleware/auth");
const { prisma } = require("../src/config/db");

describe("auth middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("generateToken", () => {
    it("should return a valid JWT with sub and role claims", () => {
      const user = { id: "user-1", role: "CUSTOMER" };
      const token = generateToken(user);

      expect(typeof token).toBe("string");
      const decoded = jwt.verify(token, "test-secret-for-jest");
      expect(decoded.sub).toBe("user-1");
      expect(decoded.role).toBe("CUSTOMER");
    });

    it("should set 7d expiry", () => {
      const user = { id: "user-1", role: "ADMIN" };
      const token = generateToken(user);
      const decoded = jwt.verify(token, "test-secret-for-jest");

      expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60);
    });
  });

  describe("authenticate", () => {
    it("should throw when authorization header is missing", async () => {
      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
      expect(err.message).toMatch(/Missing or invalid authorization header/);
    });

    it("should throw when authorization header does not start with Bearer", async () => {
      req.headers.authorization = "Basic abc123";

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
    });

    it("should throw when token is invalid", async () => {
      req.headers.authorization = "Bearer invalid-token";

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
      expect(err.message).toMatch(/Invalid or expired token/);
    });

    it("should throw when token is expired", async () => {
      const expiredToken = jwt.sign(
        { sub: "user-1", role: "CUSTOMER" },
        "test-secret-for-jest",
        { expiresIn: "-1s" }
      );
      req.headers.authorization = `Bearer ${expiredToken}`;

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
    });

    it("should throw when user no longer exists in DB", async () => {
      const token = jwt.sign(
        { sub: "deleted-user", role: "CUSTOMER" },
        "test-secret-for-jest",
        { expiresIn: "1h" }
      );
      req.headers.authorization = `Bearer ${token}`;
      prisma.user.findUnique.mockResolvedValue(null);

      await authenticate(req, res, next);
      // flush the extra microtask created by the rejected promise propagating through .catch(next)
      await new Promise((r) => process.nextTick(r));

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
      expect(err.message).toMatch(/User no longer exists/);
    });

    it("should set req.user and call next on valid token", async () => {
      const user = { id: "user-1", role: "CUSTOMER", email: "a@b.com" };
      const token = jwt.sign(
        { sub: "user-1", role: "CUSTOMER" },
        "test-secret-for-jest",
        { expiresIn: "1h" }
      );
      req.headers.authorization = `Bearer ${token}`;
      prisma.user.findUnique.mockResolvedValue(user);

      await authenticate(req, res, next);

      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe("requireAdmin", () => {
    it("should call next when user is ADMIN", () => {
      req.user = { role: "ADMIN" };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("should throw 403 when user is not ADMIN", () => {
      req.user = { role: "CUSTOMER" };

      expect(() => requireAdmin(req, res, next)).toThrow(/Admin access required/);
    });
  });
});
