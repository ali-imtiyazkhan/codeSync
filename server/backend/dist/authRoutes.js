"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("@codesync/db");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "codesync_jwt_secret_change_in_production";
const JWT_EXPIRES_IN = "7d";
const generateToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ sub: userId, email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
    }
    try {
        const existing = await db_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: "An account with this email already exists." });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 12);
        const user = await db_1.prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashed,
            },
        });
        const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
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
    }
    catch (err) {
        console.error("[signup]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
    }
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            // No account or it was created via OAuth (no password set)
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
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
    }
    catch (err) {
        console.error("[signin]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
router.post("/oauth-token", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: "Email is required." });
        return;
    }
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        const token = generateToken(user.id, user.email);
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
            },
        });
    }
    catch (err) {
        console.error("[oauth-token]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "No token provided." });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await db_1.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, name: true, email: true, image: true },
        });
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        res.json({ user });
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token." });
    }
});
exports.default = router;
