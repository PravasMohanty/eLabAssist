// src/routes/bill.routes.js
import { Router } from "express";

import { createBill, listBills, getBillById, updateBill, getInvoice } from "../controllers/bill.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateCreateBill, validateUpdateBill } from "../middleware/bill.validation.js";

const BillRouter = Router();

// All routes require a valid JWT
BillRouter.use(authenticate);

// POST /api/bills
BillRouter.post("/", authorize("receptionist", "admin"), validateCreateBill, createBill);

// GET /api/bills
BillRouter.get("/", listBills);

// GET /api/bills/:id/invoice  ← MUST be before /:id
BillRouter.get("/:id/invoice", getInvoice);

// GET /api/bills/:id
BillRouter.get("/:id", getBillById);

// PUT /api/bills/:id
BillRouter.put("/:id", authorize("admin"), validateUpdateBill, updateBill);

export default BillRouter;