import * as PaymentModel from "../models/payment.model.js";
import { success, error } from "../helpers/response.js";

/* =========================
   GET ALL TRANSACTION LOGS
========================= */
export const getAllPayments = async (req, res) => {
    try {
        const payments = await PaymentModel.getAll();
        return success(res, payments, "Financial transaction logs fetched successfully");
    } catch (err) {
        console.error("getAllPayments error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET TRANSACTIONS BY CUSTOMER ID
   (For Flutter Wallet / Invoice List Widgets)
========================= */
export const getPaymentsByCustomer = async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await PaymentModel.getByUserId(userId);
        return success(res, payments, "Customer billing statements processed successfully");
    } catch (err) {
        console.error("getPaymentsByCustomer error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET SINGLE TRANSACTION DETAIL BY ID
========================= */
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params; // payment_id format (e.g., PAY001)
        const payment = await PaymentModel.getById(id);

        if (!payment) return error(res, "Payment transaction verification record not found", 404);

        return success(res, payment, "Payment voucher record verified successfully");
    } catch (err) {
        console.error("getPaymentById error:", err);
        return error(res, err.message);
    }
};

/* =========================
   RECORD A RECEIPT / PAYMENT TRANSIT
========================= */
export const createPayment = async (req, res) => {
    try {
        const paymentData = {
            user_id: req.body.user_id,               // Linked target account reference key
            payment_method: req.body.payment_method, // e.g., 'Cash on Delivery', 'Bank Transfer', 'Card Online'
            amount: req.body.amount                 // Decimal financial entry matching transaction cost
        };

        const result = await PaymentModel.create(paymentData);
        return success(res, result, "Payment receipt balanced and recorded successfully", 201);
    } catch (err) {
        console.error("createPayment error:", err);
        return error(res, err.message);
    }
};

/* =========================
   UPDATE TRANSACTION BY ID
========================= */
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params; // payment_id reference

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Transaction payment key token is required",
            });
        }

        /* Build safe modifications object layout */
        const updateData = {};
        for (const [key, value] of Object.entries(req.body)) {
            updateData[key] = value === undefined ? null : value;
        }

        const updated = await PaymentModel.updateById(id, updateData);

        if (!updated || updated.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Payment logs registry item not found or balance adjustment matches original values",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Ledger transaction reference modifications saved successfully",
        });
    } catch (err) {
        console.error("updatePayment error:", err);
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

/* =========================
   DELETE PAYMENT RECORD BY ID
========================= */
export const deletePaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await PaymentModel.deleteById(id);

        if (!deleted) {
            return error(res, "Payment voucher reference line entry not found", 404);
        }

        return success(res, null, "Transaction log line entry removed from active tracking tables");
    } catch (err) {
        console.error("deletePaymentById error:", err);
        return error(res, err.message);
    }
};