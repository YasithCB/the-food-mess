import * as WhatNextModel from "../models/whatNext.model.js";
import { success, error } from "../helpers/response.js";

/* =========================
   GET ALL SLOTS
========================= */
export const getAllSlots = async (req, res) => {
    try {
        const slots = await WhatNextModel.getAll();
        return success(res, slots, "Complete schedule registry fetched successfully");
    } catch (err) {
        console.error("getAllSlots error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET ACTIVE FLUTTER HOME WINDOW 
   (Serves the 3-Column sliding dashboard cards)
========================= */
export const getMenuTimeline = async (req, res) => {
    try {
        const slots = await WhatNextModel.getSlidingWindow();
        return success(res, slots, "Active sliding menu window fetched successfully");
    } catch (err) {
        console.error("getMenuTimeline error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET SINGLE SLOT BY ID
========================= */
export const getSlotById = async (req, res) => {
    try {
        const { id } = req.params;
        const slot = await WhatNextModel.getById(id);

        if (!slot) return error(res, "Schedule entry slot not found", 404);

        return success(res, slot, "Schedule slot entry fetched successfully");
    } catch (err) {
        console.error("getSlotById error:", err);
        return error(res, err.message);
    }
};

/* =========================
   CREATE A DAILY SLOT
========================= */
export const createSlot = async (req, res) => {
    try {
        const slotData = {
            meal_date: req.body.meal_date, // YYYY-MM-DD
            meal_time: req.body.meal_time, // Breakfast, Lunch, Dinner
            curries: req.body.curries       // Plain text or comma-separated list
        };

        const result = await WhatNextModel.create(slotData);
        return success(res, result, "New timeline schedule slot recorded successfully", 201);
    } catch (err) {
        console.error("createSlot error:", err);
        // Captures potential MySQL schema errors (e.g., matching the UNIQUE constraints)
        if (err.code === "ER_DUP_ENTRY") {
            return error(res, "A menu entry already exists for this specific date and meal interval slot", 400);
        }
        return error(res, err.message);
    }
};

/* =========================
   UPDATE SLOT BY ID
========================= */
export const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Schedule slot ID identifier is required",
            });
        }

        /* Build safe update parameters */
        const updateData = {};
        for (const [key, value] of Object.entries(req.body)) {
            updateData[key] = value === undefined ? null : value;
        }

        const updated = await WhatNextModel.updateById(id, updateData);

        if (!updated || updated.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Schedule slot entry not found or no modifications made",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Schedule timeline updates recorded successfully",
        });
    } catch (err) {
        console.error("updateSlot error:", err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                status: "error",
                message: "Adjustment conflicts with an existing entry for that date and meal time",
            });
        }
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

/* =========================
   DELETE SLOT BY ID
========================= */
export const deleteSlotById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await WhatNextModel.deleteById(id);

        if (!deleted) {
            return error(res, "Timeline slot entry not found", 404);
        }

        return success(res, null, "Timeline schedule slot removed successfully");
    } catch (err) {
        console.error("deleteSlotById error:", err);
        return error(res, err.message);
    }
};