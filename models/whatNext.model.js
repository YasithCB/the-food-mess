import { pool } from "../db.js";

/* =========================
   GET ALL ROTATING SCHEDULES
========================= */
export const getAll = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM what_next ORDER BY meal_date DESC, FIELD(meal_time, 'Breakfast', 'Lunch', 'Dinner')`
    );
    return rows;
};

/* =========================
   GET SLIDING WINDOW SLOTS FOR THE APP
   (Fetches relevant menus matching current dates)
========================= */
export const getSlidingWindow = async () => {
    // This matching logic pulls current/upcoming daily menus
    // to dynamically fill your 3-column Flutter layout row.
    const query = `
        (SELECT id, meal_date, meal_time, curries, date_created, updated_at
         FROM what_next
         WHERE meal_date = CURRENT_DATE 
           AND (
             (HOUR(NOW()) < 10 AND meal_time IN ('Breakfast', 'Lunch', 'Dinner')) OR
             (HOUR(NOW()) BETWEEN 10 AND 14 AND meal_time IN ('Lunch', 'Dinner')) OR
             (HOUR(NOW()) >= 15 AND meal_time = 'Dinner')
           )
        )
        UNION ALL
        (SELECT id, meal_date, meal_time, curries, date_created, updated_at
         FROM what_next
         WHERE meal_date = DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)
        )
        ORDER BY meal_date ASC, FIELD(meal_time, 'Breakfast', 'Lunch', 'Dinner')
        LIMIT 3
    `;

    const [rows] = await pool.execute(query);
    return rows;
};

/* =========================
   GET BY ID
========================= */
export const getById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM what_next WHERE id = ?`,
        [id]
    );
    return rows[0];
};

/* =========================
   CREATE DAILY TIMELINE SLOT
========================= */
export const create = async (data) => {
    // Generate sequential custom string ID like WN001, WN002
    const [lastRecord] = await pool.execute(
        `SELECT id FROM what_next ORDER BY date_created DESC LIMIT 1`
    );

    let nextNumber = 1;
    if (lastRecord.length > 0 && lastRecord[0].id.startsWith("WN")) {
        const lastIdNum = parseInt(lastRecord[0].id.replace("WN", ""), 10);
        if (!isNaN(lastIdNum)) {
            nextNumber = lastIdNum + 1;
        }
    }
    const customId = `WN${String(nextNumber).padStart(3, "0")}`;

    const query = `
        INSERT INTO what_next (
            id, meal_date, meal_time, curries
        ) VALUES (?, ?, ?, ?)
    `;

    const params = [
        customId,
        data.meal_date || null, // Format: YYYY-MM-DD
        data.meal_time || null, // Breakfast, Lunch, or Dinner
        data.curries || null
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

    const allowedFields = ["meal_date", "meal_time", "curries"];
    const setParts = [];
    const values = [];

    for (const [key, val] of Object.entries(fields)) {
        if (!allowedFields.includes(key)) continue;

        setParts.push(`\`${key}\` = ?`);
        values.push(val ?? null);
    }

    setParts.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const query = `
        UPDATE what_next
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
        `DELETE FROM what_next WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
};