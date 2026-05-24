import express from "express";
import {
    createOrder,
    deleteOrderById,
    getAllOrders,
    getOrderById,
    getOrdersByCustomer,
    updateOrder
} from "../controllers/order.controller.js";

const router = express.Router();

/* =========================
   ROUTES
========================= */

// Create a new meal booking
router.post("/", createOrder);

// Fetch all order lines across the entire system
router.get("/", getAllOrders);

// Load the historical booking timeline for a specific user ID
router.get("/customer/:userId", getOrdersByCustomer);

// Fetch granular receipt verification details by Order ID reference
router.get("/:id", getOrderById);

// Adjust existing order details by ID
router.put("/:id", updateOrder);

// Remove a transaction block by ID from active management sheets
router.delete("/:id", deleteOrderById);

export default router;