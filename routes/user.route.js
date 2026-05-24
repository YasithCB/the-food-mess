import express from "express";
import {
    getAllUsers,
    getUserById,
    getUserByMobile,
    createUser,
    updateUser,
    deleteUserById
} from "../controllers/user.controller.js";

const router = express.Router();

/* =========================
   ROUTES
========================= */

// Create/Register a new user profile
router.post("/", createUser);

// Get a directory listing of all users
router.get("/", getAllUsers);

// Look up a specific user profile by their mobile number
router.get("/mobile/:mobile", getUserByMobile);

// Fetch a single user profile details by ID
router.get("/:id", getUserById);

// Update specific attributes of a user profile by ID
router.put("/:id", updateUser);

// Remove a user profile completely by ID
router.delete("/:id", deleteUserById);

export default router;