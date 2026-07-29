import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categories.js";

const router = Router();

// All category routes require authentication
router.use(auth);

router.get("/", getCategories);
router.post("/", createCategory);
router.delete("/:id", deleteCategory);

export default router;
