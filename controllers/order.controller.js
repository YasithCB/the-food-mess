import * as OrderModel from "../models/orders.model.js";
import { success, error } from "../helpers/response.js";

/* =========================
   GET ALL ORDERS
========================= */
export const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderModel.getAll();
        return success(res, orders, "All bookings fetched successfully");
    } catch (err) {
        console.error("getAllOrders error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET ORDERS BY CUSTOMER ID
   (For Flutter Dashboard History Cards)
========================= */
export const getOrdersByCustomer = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await OrderModel.getByUserId(userId);
        return success(res, orders, "Customer booking history loaded successfully");
    } catch (err) {
        console.error("getOrdersByCustomer error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET SINGLE ORDER BY ID
========================= */
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params; // order_id string format (e.g., ORD-001)
        const order = await OrderModel.getById(id);

        if (!order) return error(res, "Order booking reference not found", 404);

        return success(res, order, "Order entry verified successfully");
    } catch (err) {
        console.error("getOrderById error:", err);
        return error(res, err.message);
    }
};

/* =========================
   CREATE A NEW ORDER
========================= */
export const createOrder = async (req, res) => {
    try {
        const orderData = {
            user_id: req.body.user_id,       // Numeric user key reference
            meal_date: req.body.meal_date,   // Format: YYYY-MM-DD
            meal_time: req.body.meal_time,   // Breakfast, Lunch, Dinner
            meal_name: req.body.meal_name,
            qty: req.body.qty !== undefined ? parseInt(req.body.qty, 10) : 1,
            unit_price: req.body.unit_price  // Stored manually to preserve static historical price data
        };

        const result = await OrderModel.create(orderData);
        return success(res, result, "Order booking processed successfully", 201);
    } catch (err) {
        console.error("createOrder error:", err);
        return error(res, err.message);
    }
};

/* =========================
   UPDATE ORDER DETAILS BY ID
========================= */
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params; // order_id string

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Order identifier reference key is required",
            });
        }

        /* Build clean parameter updates */
        const updateData = {};
        for (const [key, value] of Object.entries(req.body)) {
            // total_price is explicitly blocked if passed, as it is a DB-side STORED column expression
            if (key === "total_price") continue;
            updateData[key] = value === undefined ? null : value;
        }

        const updated = await OrderModel.updateById(id, updateData);

        if (!updated || updated.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Order confirmation reference not found or values matching original records",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Order specification changes updated successfully",
        });
    } catch (err) {
        console.error("updateOrder error:", err);
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

/* =========================
   DELETE ORDER BY ID
========================= */
export const deleteOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await OrderModel.deleteById(id);

        if (!deleted) {
            return error(res, "Order reference profile not found", 404);
        }

        return success(res, null, "Order record removed successfully from database active lines");
    } catch (err) {
        console.error("deleteOrderById error:", err);
        return error(res, err.message);
    }
};