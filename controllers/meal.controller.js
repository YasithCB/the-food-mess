import * as MealModel from "../models/meal.model.js";
import { success, error } from "../helpers/response.js";

/* =========================
   GET ALL MEALS
========================= */
export const getAllMeals = async (req, res) => {
    try {
        const meals = await MealModel.getAll();
        return success(res, meals, "Meals fetched successfully");
    } catch (err) {
        console.error("getAllMeals error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET MEALS BY TIME INTERVAL
========================= */
export const getMealsByTime = async (req, res) => {
    try {
        const { mealTime } = req.params; // e.g., Breakfast, Lunch, Dinner, Anytime
        const meals = await MealModel.getByMealTime(mealTime);
        return success(res, meals, `Meals for ${mealTime} fetched successfully`);
    } catch (err) {
        console.error("getMealsByTime error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET SINGLE MEAL BY ID
========================= */
export const getMealById = async (req, res) => {
    try {
        const { id } = req.params;
        const meal = await MealModel.getById(id);

        if (!meal) return error(res, "Meal item not found", 404);

        return success(res, meal, "Meal fetched successfully");
    } catch (err) {
        console.error("getMealById error:", err);
        return error(res, err.message);
    }
};

/* =========================
   CREATE A MEAL ITEM
========================= */
export const createMeal = async (req, res) => {
    try {
        const mealData = {
            ...req.body,
            // Capture single banner photo path if uploaded via middleware (e.g., multer)
            image_url: req.file ? req.file.path : (req.body.image_url || null)
        };

        const result = await MealModel.create(mealData);
        return success(res, result, "Meal item created successfully", 201);
    } catch (err) {
        console.error("createMeal error:", err);
        return error(res, err.message);
    }
};

/* =========================
   UPDATE MEAL BY ID
========================= */
export const updateMeal = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Meal ID is required",
            });
        }

        /* Build clean updatable object state */
        const updateData = {};
        for (const [key, value] of Object.entries(req.body)) {
            updateData[key] = value === undefined ? null : value;
        }

        /* Handle single image replacement cleanly */
        if (req.file) {
            updateData.image_url = req.file.path;
        } else if (req.body.image_url !== undefined) {
            updateData.image_url = req.body.image_url;
        }

        const updated = await MealModel.updateById(id, updateData);

        if (!updated || updated.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Meal item not found or data unchanged",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Meal details updated successfully",
        });
    } catch (err) {
        console.error("updateMeal error:", err);
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

/* =========================
   DELETE MEAL BY ID
========================= */
export const deleteMealById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await MealModel.deleteById(id);

        if (!deleted) {
            return error(res, "Meal item not found", 404);
        }

        return success(res, null, "Meal item deleted successfully");
    } catch (err) {
        console.error("deleteMealById error:", err);
        return error(res, err.message);
    }
};