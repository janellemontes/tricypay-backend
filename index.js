import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import driversRouter from "./routes/drivers.js";
import operatorsRouter from "./routes/operators.js";
import franchisesRouter from "./routes/franchises.js";
import todasRouter from "./routes/todas.js";
import vehiclesRouter from "./routes/vehicles.js";
import assignmentsRouter from "./routes/assignments.js";
import authRoutes from "./routes/auth.js";
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Allowed origins (local + ngrok + Render frontend)
const allowedOrigins = [
  "http://localhost:5173",
  "https://eura-unslanderous-revertively.ngrok-free.dev",
  process.env.FRONTEND_URL, // set in Render dashboard
].filter(Boolean); // remove undefined values

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow curl / Postman / mobile apps

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use("/drivers", driversRouter);
app.use("/operators", operatorsRouter);
app.use("/franchises", franchisesRouter);
app.use("/todas", todasRouter);
app.use("/vehicles", vehiclesRouter);
app.use("/assignments", assignmentsRouter);
app.use("/auth", authRoutes);

// ✅ Example protected route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: `Welcome, driver ${req.user.driver_id}` });
});

// ✅ Health check (important for Render!)
app.get("/", (req, res) => {
  res.send("✅ Tricypay backend is running");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log("✅ Allowed origins:", allowedOrigins);
});
