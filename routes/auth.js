// routes/auth.js
import express from "express";
import supabase from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================
// Login (JWT)
// ========================
router.post("/login", async (req, res) => {
  const { driver_id, password } = req.body;

  if (!driver_id || !password) {
    return res.status(400).json({ error: "Driver ID and password required" });
  }

  const { data: driver, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("driver_id", driver_id)
    .single();

  if (error || !driver) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, driver.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // ✅ Generate JWT
  const token = jwt.sign(
    { driver_id: driver.driver_id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // ✅ Send token in cookie
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ message: "Login successful", token });
});

// ========================
// Logout (clear cookie)
// ========================
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// ========================
// Driver QR (must be logged in)
// ========================
router.get("/me/qr", authMiddleware, async (req, res) => {
  const { driver_id } = req.user;

  const { data: driver, error } = await supabase
    .from("drivers")
    .select("driver_id, driver_name_clean, franchise_id, operator_id, toda")
    .eq("driver_id", driver_id)
    .single();

  if (error || !driver) {
    return res.status(404).json({ error: "Driver not found" });
  }

  try {
    const qrData = JSON.stringify(driver);
    const qrImage = await QRCode.toBuffer(qrData, { type: "png" });

    res.setHeader("Content-Type", "image/png");
    res.send(qrImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

export default router;
