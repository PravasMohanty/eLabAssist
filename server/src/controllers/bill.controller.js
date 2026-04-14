// src/controllers/bill.controller.js
const supabase = require("../config/db");
const { generateBillId } = require("../utils/idGenerator");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────────
// POST /api/bills
// Access: receptionist, admin
// ─────────────────────────────────────────────
const createBill = async (req, res) => {
    try {
        const {
            patient_id,
            urgency = "routine",
            total_amount,
            discount = 0,
            paid_amount = 0,
            status = "active",
            items = [], // stored as JSONB — array of { description, quantity, unit_price, amount }
        } = req.body;

        // Validate patient exists
        const { data: patient, error: patientError } = await supabase
            .from("patients")
            .select("id")
            .eq("id", patient_id)
            .single();

        if (patientError || !patient) {
            return errorResponse(res, "Patient not found", 404);
        }

        const net_amount = total_amount - discount;

        // Derive payment_status from amounts
        let payment_status = "unpaid";
        if (paid_amount >= net_amount) payment_status = "paid";
        else if (paid_amount > 0) payment_status = "partial";

        const bill_number = await generateBillId("BILL");

        const { data: bill, error } = await supabase
            .from("bills")
            .insert({
                bill_number,
                patient_id,
                urgency,
                total_amount,
                discount,
                net_amount,
                paid_amount,
                payment_status,
                status,
                created_by_user_id: req.user?.id ?? null,
                items,
            })
            .select(`*, patients ( id, name, phone )`)
            .single();

        if (error) throw error;

        return successResponse(res, bill, "Bill created successfully", 201);
    } catch (err) {
        console.error("createBill error:", err);
        return errorResponse(res, err.message || "Failed to create bill", 500);
    }
};

// ─────────────────────────────────────────────
// GET /api/bills
// Access: all authenticated
// Query params: status, payment_status, patient_id, from_date, to_date, page, limit
// ─────────────────────────────────────────────
const listBills = async (req, res) => {
    try {
        const {
            status,
            payment_status,
            patient_id,
            from_date,
            to_date,
            page = 1,
            limit = 20,
        } = req.query;

        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;

        let query = supabase
            .from("bills")
            .select(`*, patients ( id, name, phone )`, { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (status) query = query.eq("status", status);
        if (payment_status) query = query.eq("payment_status", payment_status);
        if (patient_id) query = query.eq("patient_id", patient_id);
        if (from_date) query = query.gte("created_at", from_date);
        if (to_date) query = query.lte("created_at", to_date);

        const { data: bills, error, count } = await query;

        if (error) throw error;

        return successResponse(res, {
            bills,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error("listBills error:", err);
        return errorResponse(res, err.message || "Failed to fetch bills", 500);
    }
};

// ─────────────────────────────────────────────
// GET /api/bills/:id
// Access: all authenticated
// ─────────────────────────────────────────────
const getBillById = async (req, res) => {
    try {
        const { data: bill, error } = await supabase
            .from("bills")
            .select(`
        *,
        patients ( id, name, phone, email, address, date_of_birth ),
        users:created_by_user_id ( id, name, email, role )
      `)
            .eq("id", req.params.id)
            .single();

        if (error || !bill) {
            return errorResponse(res, "Bill not found", 404);
        }

        return successResponse(res, bill);
    } catch (err) {
        console.error("getBillById error:", err);
        return errorResponse(res, err.message || "Failed to fetch bill", 500);
    }
};

// ─────────────────────────────────────────────
// PUT /api/bills/:id
// Access: admin only
// ─────────────────────────────────────────────
const updateBill = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch current state first
        const { data: existing, error: fetchError } = await supabase
            .from("bills")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !existing) {
            return errorResponse(res, "Bill not found", 404);
        }

        const { total_amount, discount, paid_amount, urgency, status, items } = req.body;

        // Recalculate financials if any amount field changed
        const updatedTotal = total_amount ?? existing.total_amount;
        const updatedDiscount = discount ?? existing.discount;
        const updatedPaid = paid_amount ?? existing.paid_amount;
        const updatedNet = updatedTotal - updatedDiscount;

        let payment_status = "unpaid";
        if (updatedPaid >= updatedNet) payment_status = "paid";
        else if (updatedPaid > 0) payment_status = "partial";

        const updatePayload = {
            total_amount: updatedTotal,
            discount: updatedDiscount,
            net_amount: updatedNet,
            paid_amount: updatedPaid,
            payment_status,
            ...(urgency && { urgency }),
            ...(status && { status }),
            ...(items && { items }),
            updated_at: new Date().toISOString(),
        };

        const { data: updated, error } = await supabase
            .from("bills")
            .update(updatePayload)
            .eq("id", id)
            .select(`*, patients ( id, name, phone )`)
            .single();

        if (error) throw error;

        return successResponse(res, updated, "Bill updated successfully");
    } catch (err) {
        console.error("updateBill error:", err);
        return errorResponse(res, err.message || "Failed to update bill", 500);
    }
};

// ─────────────────────────────────────────────
// GET /api/bills/:id/invoice
// Access: all authenticated
// ─────────────────────────────────────────────
const getInvoice = async (req, res) => {
    try {
        const { data: bill, error } = await supabase
            .from("bills")
            .select(`
        *,
        patients ( id, name, phone, email, address, date_of_birth ),
        users:created_by_user_id ( id, name )
      `)
            .eq("id", req.params.id)
            .single();

        if (error || !bill) {
            return errorResponse(res, "Bill not found", 404);
        }

        const invoice = {
            invoice_number: bill.bill_number,
            issued_at: bill.created_at,
            patient: {
                id: bill.patients.id,
                name: bill.patients.name,
                phone: bill.patients.phone,
                email: bill.patients.email,
                address: bill.patients.address,
            },
            urgency: bill.urgency,
            items: bill.items || [],
            financials: {
                total_amount: bill.total_amount,
                discount: bill.discount,
                net_amount: bill.net_amount,
                paid_amount: bill.paid_amount,
                balance_due: bill.net_amount - bill.paid_amount,
            },
            payment_status: bill.payment_status,
            status: bill.status,
            generated_by: bill.users?.name || "System",
        };

        return successResponse(res, invoice, "Invoice fetched successfully");
    } catch (err) {
        console.error("getInvoice error:", err);
        return errorResponse(res, err.message || "Failed to generate invoice", 500);
    }
};

module.exports = { createBill, listBills, getBillById, updateBill, getInvoice };