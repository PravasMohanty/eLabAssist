// src/routes/bill.routes.js
import { Router } from "express";
const BillRouter = Router

const { createBill, listBills, getBillById, updateBill, getInvoice } = require("../controllers/bill.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validateCreateBill, validateUpdateBill } = require("../middleware/bill.validation");

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

module.exports = BillRouter;