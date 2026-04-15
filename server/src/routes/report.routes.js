import express from "express";
import {
  createReport,
  getReport,
  updateReport,
} from "../controllers/report.controller.js";

const router = express.Router();

router.post("/appointment/:appointmentId", createReport);
router.get("/:id", getReport);
router.put("/:id", updateReport);

export default router;