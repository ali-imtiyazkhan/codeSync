import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@codesync/db";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "codesync_jwt_secret_change_in_production";
const JWT_EXPIRES_IN = "7d";

// POST /api/auth/signup

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashed,
      },
    });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (err) {
    console.error("[signup]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /api/auth/signin ────────────────────────────────────────────────────

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      // No account or it was created via OAuth (no password set)
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({
      message: "Signed in successfully.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (err) {
    console.error("[signin]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the current user from the JWT token – useful for the VS Code extension.

router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided." });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, image: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
});

export default router;
