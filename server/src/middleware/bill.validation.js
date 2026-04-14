// src/middleware/bill.validation.js
const { errorResponse } = require("../utils/apiResponse");

const VALID_URGENCY = ["routine", "urgent", "emergency"];
const VALID_PAYMENT_STATUS = ["unpaid", "partial", "paid", "refunded"];
const VALID_STATUS = ["active", "cancelled", "void"];

const validateCreateBill = (req, res, next) => {
    const errors = [];
    const { patient_id, total_amount, urgency, payment_status, status } = req.body;

    if (!patient_id) errors.push("patient_id is required");

    if (total_amount === undefined || total_amount === null) {
        errors.push("total_amount is required");
    } else if (typeof total_amount !== "number" || total_amount < 0) {
        errors.push("total_amount must be a non-negative number");
    }

    if (req.body.discount !== undefined && (typeof req.body.discount !== "number" || req.body.discount < 0))
        errors.push("discount must be a non-negative number");

    if (req.body.paid_amount !== undefined && (typeof req.body.paid_amount !== "number" || req.body.paid_amount < 0))
        errors.push("paid_amount must be a non-negative number");

    if (urgency && !VALID_URGENCY.includes(urgency))
        errors.push(`urgency must be one of: ${VALID_URGENCY.join(", ")}`);

    if (payment_status && !VALID_PAYMENT_STATUS.includes(payment_status))
        errors.push(`payment_status must be one of: ${VALID_PAYMENT_STATUS.join(", ")}`);

    if (status && !VALID_STATUS.includes(status))
        errors.push(`status must be one of: ${VALID_STATUS.join(", ")}`);

    if (errors.length > 0) return errorResponse(res, errors.join("; "), 422);

    next();
};

const validateUpdateBill = (req, res, next) => {
    const errors = [];
    const { total_amount, discount, paid_amount, urgency, payment_status, status } = req.body;

    if (total_amount !== undefined && (typeof total_amount !== "number" || total_amount < 0))
        errors.push("total_amount must be a non-negative number");

    if (discount !== undefined && (typeof discount !== "number" || discount < 0))
        errors.push("discount must be a non-negative number");

    if (paid_amount !== undefined && (typeof paid_amount !== "number" || paid_amount < 0))
        errors.push("paid_amount must be a non-negative number");

    if (urgency && !VALID_URGENCY.includes(urgency))
        errors.push(`urgency must be one of: ${VALID_URGENCY.join(", ")}`);

    if (payment_status && !VALID_PAYMENT_STATUS.includes(payment_status))
        errors.push(`payment_status must be one of: ${VALID_PAYMENT_STATUS.join(", ")}`);

    if (status && !VALID_STATUS.includes(status))
        errors.push(`status must be one of: ${VALID_STATUS.join(", ")}`);

    if (errors.length > 0) return errorResponse(res, errors.join("; "), 422);

    next();
};

module.exports = { validateCreateBill, validateUpdateBill };