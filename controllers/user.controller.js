import * as UserModel from "../models/users.model.js";
import { success, error } from "../helpers/response.js";

/* =========================
   GET ALL USERS
========================= */
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.getAll();
        return success(res, users, "Users profile directory fetched successfully");
    } catch (err) {
        console.error("getAllUsers error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET SINGLE USER BY ID
========================= */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.getById(id);

        if (!user) return error(res, "User record not found", 404);

        return success(res, user, "User profile fetched successfully");
    } catch (err) {
        console.error("getUserById error:", err);
        return error(res, err.message);
    }
};

/* =========================
   GET SINGLE USER BY MOBILE
========================= */
export const getUserByMobile = async (req, res) => {
    try {
        const { mobile } = req.params;
        const user = await UserModel.getByMobile(mobile);

        if (!user) return error(res, "No user accounts registered under this mobile number", 404);

        // Strip password hash if returning this info publicly or to client dashboards
        const { password, ...safeUserData } = user;

        return success(res, safeUserData, "User found successfully");
    } catch (err) {
        console.error("getUserByMobile error:", err);
        return error(res, err.message);
    }
};

/* =========================
   CREATE A USER
========================= */
export const createUser = async (req, res) => {
    try {
        const userData = {
            name: req.body.name,
            mobile: req.body.mobile,
            password: req.body.password // ⚠️ Ensure this is securely encrypted using bcrypt before model transit
        };

        const result = await UserModel.create(userData);
        return success(res, result, "User account registered successfully", 201);
    } catch (err) {
        console.error("createUser error:", err);
        return error(res, err.message);
    }
};

/* =========================
   UPDATE USER BY ID
========================= */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "User account identifier ID is required",
            });
        }

        /* Build clean updatable data snapshot */
        const updateData = {};
        for (const [key, value] of Object.entries(req.body)) {
            updateData[key] = value === undefined ? null : value;
        }

        const updated = await UserModel.updateById(id, updateData);

        if (!updated || updated.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "User profile not found or parameters matching original values",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "User profile adjustments recorded successfully",
        });
    } catch (err) {
        console.error("updateUser error:", err);
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

/* =========================
   DELETE USER BY ID
========================= */
export const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await UserModel.deleteById(id);

        if (!deleted) {
            return error(res, "User profile not found", 404);
        }

        return success(res, null, "User profile removed successfully");
    } catch (err) {
        console.error("deleteUserById error:", err);
        return error(res, err.message);
    }
};