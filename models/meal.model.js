import { pool } from "../db.js";

/* =========================
   GET ALL MEALS
========================= */
export const getAll = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM meal ORDER BY date_created DESC`
    );
    return rows;
};

/* =========================
   GET BY MEAL TIME (Breakfast, Lunch, Dinner, Anytime)
========================= */
export const getByMealTime = async (mealTime) => {
    const [rows] = await pool.execute(
        `SELECT * 
         FROM meal 
         WHERE meal_time = ? 
         ORDER BY date_created DESC`,
        [mealTime]
    );
    return rows;
};

/* =========================
   GET BY ID
========================= */
export const getById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM meal WHERE id = ?`,
        [id]
    );
    return rows[0];
};

/* =========================
   CREATE MEAL
========================= */
export const create = async (data) => {
    // 🔹 Generate unique ID like ML011, ML012 sequentially
    const [lastMeal] = await pool.execute(
        `SELECT id FROM meal ORDER BY date_created DESC LIMIT 1`
    );

    let nextNumber = 1;
    if (lastMeal.length > 0 && lastMeal[0].id.startsWith("ML")) {
        const lastIdNum = parseInt(lastMeal[0].id.replace("ML", ""), 10);
        if (!isNaN(lastIdNum)) {
            nextNumber = lastIdNum + 1;
        }
    }
    const customId = `ML${String(nextNumber).padStart(3, "0")}`;

    const query = `
        INSERT INTO meal (
            id, meal_time, name, price, image_url, description
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
        customId,
        data.meal_time || "Anytime",
        data.name || null,
        data.price || "0.00",
        data.image_url || null,
        data.description || null
    ];

    const sanitizedParams = params.map(v => v === undefined ? null : v);

    await pool.execute(query, sanitizedParams);
    return { insertedId: customId };
};

/* =========================
   UPDATE BY ID
========================= */
export const updateById = async (id, fields) => {
    if (!fields || Object.keys(fields).length === 0) return false;

    const allowedFields = [
        "meal_time",
        "name",
        "price",
        "image_url",
        "description"
    ];

    const setParts = [];
    const values = [];

    for (const [key, val] of Object.entries(fields)) {
        if (!allowedFields.includes(key)) continue;

        setParts.push(`\`${key}\` = ?`);
        values.push(val ?? null);
    }

    // updated_at will handle itself automatically via schema definition,
    // but adding it here explicitly ensures it triggers cleanly
    setParts.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const query = `
        UPDATE meal
        SET ${setParts.join(", ")}
        WHERE id = ?
    `;

    const [result] = await pool.execute(query, values);
    return { affectedRows: result.affectedRows };
};

/* =========================
   DELETE BY ID
========================= */
export const deleteById = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM meal WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
};