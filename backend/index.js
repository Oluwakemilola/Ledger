import express from "express";
import cors from "cors";
import connectDB from "./database/mongodb.js";
import authRoutes from "./routes/auth.js";
import entryRoutes from "./routes/entries.js";
import categoryRoutes from "./routes/categories.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://kobo-rouge.vercel.app",
  ],
  credentials: true,
}));
app.use(express.json());

// Basic ping route
app.get("/ping", (req, res) => {
  res.json({ message: "SME Expense Tracker API is running!" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/categories", categoryRoutes);

// Database connection & Server Start
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
