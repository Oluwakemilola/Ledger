import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
} from "../controllers/entries.js";

const router = Router();

// All entry routes require authentication
router.use(auth);

router.get("/", getEntries);
router.post("/", createEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

export default router;
