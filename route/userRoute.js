import express from "express";
import { test, signUp, logIn } from "../controller/authController.js";
import {
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
} from "../controller/userController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Example route
router.get("/status", (req, res) => {
  res.json({ status: "API is running" });
});
router.post("/signup", signUp);
router.post("/login", logIn);

router.get("/me", protect, getMe, getUser);
router.patch("/updateMe", protect, updateMe);
router.delete("/deleteMe", protect, deleteMe);
router.get("/", protect, restrictTo("admin"), getAllUsers);
router
  .route("/:id")
  .get(protect, restrictTo("admin"), getUser)
  .patch(protect, restrictTo("admin"), updateUserRole)
  .delete(protect, restrictTo("admin"), deleteUser);

export default router;
