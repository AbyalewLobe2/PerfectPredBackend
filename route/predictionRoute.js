import express from "express";
import {
  test,
  freePrediction,
  getAllPredictions,
  getPrediction,
  createPrediction,
  updatePrediction,
  deletePrediction,
  updateResult,
} from "../controller/predictionController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Example route
router.get("/status", (req, res) => {
  res.json({ status: "API is running" });
});

router.get("/", protect, getAllPredictions);
router.get("/free", freePrediction);
router.get("/:id", protect, getPrediction);
router.post("/", protect, restrictTo("admin"), createPrediction);
router.patch("/:id", protect, restrictTo("admin"), updatePrediction);
router.delete("/:id", protect, restrictTo("admin"), deletePrediction);
router.patch("/:id/result", protect, restrictTo("admin"), updateResult);

export default router;
