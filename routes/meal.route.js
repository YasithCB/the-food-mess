import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
    createMeal,
    deleteMealById,
    getAllMeals,
    getMealById,
    getMealsByTime,
    updateMeal
} from "../controllers/meal.controller.js";

const router = express.Router();

/* =========================
   UPLOAD DIRECTORY
========================= */
const uploadDir = "uploads/meals";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

/* =========================
   ROUTES
========================= */

// Create a new meal menu item (Handles single photo item)
router.post(
    "/",
    upload.single("image_url"),
    createMeal
);

// Update meal details or its image by ID
router.put(
    "/:id",
    upload.single("image_url"),
    updateMeal
);

// Get all meal menu items
router.get("/", getAllMeals);

// Get meals grouped by categorical time (Breakfast, Lunch, Dinner, Anytime)
router.get(
    "/time/:mealTime",
    getMealsByTime
);

// Get single meal details by ID
router.get("/:id", getMealById);

// Delete a meal item by ID
router.delete("/:id", deleteMealById);

export default router;