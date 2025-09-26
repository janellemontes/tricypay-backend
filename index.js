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
const PORT = process.env.PORT || 5000;

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://eura-unslanderous-revertively.ngrok-free.dev", // your ngrok frontend
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true, // ✅ allow cookies and Authorization headers
  })
);

app.use(express.json());
app.use(cookieParser()); // ✅ parse cookies for JWT

// Routes
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

// Health check
app.get("/", (req, res) => {
  res.send("Tricypay backend is running ✅");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log("✅ Allowed origins:", allowedOrigins);
});
