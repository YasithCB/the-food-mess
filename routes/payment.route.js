import express from "express";
import {
    createPayment,
    deletePaymentById,
    getAllPayments,
    getPaymentById,
    getPaymentsByCustomer,
    updatePayment
} from "../controllers/payment.controller.js";

const router = express.Router();

/* =========================
   ROUTES
========================= */

// Record a new payment transaction entry
router.post("/", createPayment);

// Fetch all payment ledger entries across the entire platform
router.get("/", getAllPayments);

// Load the historical payment profile logs for a specific user ID
router.get("/customer/:userId", getPaymentsByCustomer);

// Fetch a single transaction voucher file record by Payment ID reference
router.get("/:id", getPaymentById);

// Adjust payment entry properties manually by ID (e.g., fixing typos)
router.put("/:id", updatePayment);

// Erase an item from the tracking logs by ID
router.delete("/:id", deletePaymentById);

export default router;