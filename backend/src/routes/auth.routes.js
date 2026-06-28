const express = require("express");
const bcrypt = require("bcryptjs");
const { prisma } = require("../config/db");
const { asyncHandler, AppError, ApiResponse } = require("../utils");
const { authenticate, generateToken } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      throw AppError.badRequest("Email, password, and fullName are required");
    }

    if (password.length < 8) {
      throw AppError.badRequest("Password must be at least 8 characters");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw AppError.conflict("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });

    const token = generateToken(user);
    ApiResponse.created(res, { user, token });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw AppError.badRequest("Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const token = generateToken(user);
    ApiResponse.success(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    });
  }),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw AppError.notFound("User no longer exists");
    }
    ApiResponse.success(res, user);
  }),
);

// ─── OTP Login (scaffolded — requires SMS gateway integration) ────────────────

router.post(
  "/otp/send",
  asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone || phone.length < 11) {
      throw AppError.badRequest("Valid phone number is required");
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          email: `${phone}@phone.uglystore.local`,
          passwordHash: await bcrypt.hash(code, 12),
          fullName: phone,
        },
      });
    }

    await prisma.verificationCode.create({
      data: { userId: user.id, code, type: "PHONE", expiresAt },
    });

    // TODO: Integrate SMS gateway (e.g., local BD SMS provider) to send `code` to `phone`
    // For development, code is logged
    console.log(`[OTP] ${phone}: ${code}`);

    ApiResponse.success(res, { message: "OTP sent successfully" });
  }),
);

router.post(
  "/otp/verify",
  asyncHandler(async (req, res) => {
    const { phone, code } = req.body;

    if (!phone || !code) {
      throw AppError.badRequest("Phone and OTP code are required");
    }

    const user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      throw AppError.unauthorized("Invalid phone number");
    }

    const verification = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: "PHONE",
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      throw AppError.unauthorized("Invalid or expired OTP");
    }

    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    const token = generateToken(user);
    ApiResponse.success(res, {
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, phone: user.phone },
      token,
    });
  }),
);

// ─── Google OAuth (scaffolded — requires GOOGLE_CLIENT_ID/SECRET) ────────────

router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(501).json({
      success: false,
      message: "Google login is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
    });
  }

  const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
  const scope = encodeURIComponent("openid email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline`;
  res.redirect(url);
});

router.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw AppError.badRequest("Google OAuth not configured");
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw AppError.unauthorized("Google authentication failed");
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json();

    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          fullName: googleUser.name || googleUser.email,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
          isVerified: true,
        },
      });
    }

    const token = generateToken(user);
    res.redirect(`/?token=${token}`);
  }),
);

module.exports = router;
