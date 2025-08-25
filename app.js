import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./route/api.js";
import userRouter from "./route/userRoute.js";
import predictionRouter from "./route/predictionRoute.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorController.js";

dotenv.config();

const app = express();

app.use(cookieParser());
const PORT = process.env.PORT || 4000;
const ENV = process.env.NODE_ENV || "development";

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // or your frontend domain
    credentials: true,
  })
);
app.use(express.json()); // ⬅️ Use built-in JSON parser instead of body-parser
app.use(express.urlencoded({ extended: true })); // For form-data
app.use(express.static("public"));
app.use(morgan(ENV === "development" ? "dev" : "combined"));

// ✅ Routes
app.use("/api", routes);
app.use("/api/users", userRouter);
app.use("/api/predictions", predictionRouter);

// ✅ Global error handler (Optional)
app.use(errorHandler);

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${ENV} mode`);
});

export default app;
