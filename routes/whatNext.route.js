import express from "express";
import {
    createSlot,
    deleteSlotById,
    getAllSlots,
    getMenuTimeline,
    getSlotById,
    updateSlot
} from "../controllers/whatNext.controller.js";

const router = express.Router();

/* =========================
   ROUTES
========================= */

// Create a new calendar timeline slot
router.post("/", createSlot);

// Get the active sliding menu row (The 3-Column Flutter home stream)
router.get("/timeline/window", getMenuTimeline);

// Get an administrative listing of all calendar slots
router.get("/", getAllSlots);

// Get a specific schedule entry by ID
router.get("/:id", getSlotById);

// Update a specific timeline calendar item by ID
router.put("/:id", updateSlot);

// Delete an entry from the tracking schema manually by ID
router.delete("/:id", deleteSlotById);

export default router;