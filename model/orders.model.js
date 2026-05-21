import { pool } from "../db.js";

/* =========================
   GET ALL ORDERS
========================= */
export const getAll = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM orders ORDER BY date_created DESC`
    );
    return rows;
};

/* =========================
   GET BY USER ID (For Flutter "My Orders" History Screen)
========================= */
export const getByUserId = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT * 
         FROM orders 
         WHERE user_id = ? 
         ORDER BY meal_date DESC, FIELD(meal_time, 'Dinner', 'Lunch', 'Breakfast')`,
        [userId]
    );
    return rows;
};

/* =========================
   GET BY ID
========================= */
export const getById = async (orderId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM orders WHERE order_id = ?`,
        [orderId]
    );
    return rows[0];
};

/* =========================
   CREATE ORDER (App Bookings, Monthly Plans, & Call-ins)
========================= */
export const create = async (data) => {
    // 🔹 Generate sequential alphanumeric key like ORD-001, ORD-002
    const [lastOrder] = await pool.execute(
        `SELECT order_id FROM orders ORDER BY date_created DESC LIMIT 1`
    );

    let nextNumber = 1;
    if (lastOrder.length > 0 && lastOrder[0].order_id.startsWith("ORD-")) {
        const lastIdNum = parseInt(lastOrder[0].order_id.replace("ORD-", ""), 10);
        if (!isNaN(lastIdNum)) {
            nextNumber = lastIdNum + 1;
        }
    }
    const customOrderId = `ORD-${String(nextNumber).padStart(3, "0")}`;

    const query = `
        INSERT INTO orders (
            order_id, user_id, meal_date, meal_time, meal_name, qty, unit_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        customOrderId,
        data.user_id,          // Integer linking to your updated users table
        data.meal_date,        // Format: YYYY-MM-DD
        data.meal_time,        // Breakfast, Lunch, or Dinner
        data.meal_name,
        data.qty ?? 1,
        data.unit_price
    ];

    const sanitizedParams = params.map(v => v === undefined ? null : v);

    await pool.execute(query, sanitizedParams);
    return { insertedId: customOrderId };
};

/* =========================
   UPDATE BY ID
========================= */
export const updateById = async (orderId, fields) => {
    if (!fields || Object.keys(fields).length === 0) return false;

    // Allowed updatable fields based on schema restrictions
    // total_price is omitted because it is a STORED GENERATED column handled by MySQL
    const allowedFields = [
        "meal_date",
        "meal_time",
        "meal_name",
        "qty",
        "unit_price"
    ];

    const setParts = [];
    const values = [];

    for (const [key, val] of Object.entries(fields)) {
        if (!allowedFields.includes(key)) continue;

        setParts.push(`\`${key}\` = ?`);
        values.push(val ?? null);
    }

    setParts.push("updated_at = CURRENT_TIMESTAMP");
    values.push(orderId);

    const query = `
        UPDATE orders
        SET ${setParts.join(", ")}
        WHERE order_id = ?
    `;

    const [result] = await pool.execute(query, values);
    return { affectedRows: result.affectedRows };
};

/* =========================
   DELETE BY ID
========================= */
export const deleteById = async (orderId) => {
    const [result] = await pool.execute(
        `DELETE FROM orders WHERE order_id = ?`,
        [orderId]
    );

    return result.affectedRows > 0;
};