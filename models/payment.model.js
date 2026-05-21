import { pool } from "../db.js";

/* =========================
   GET ALL PAYMENTS
========================= */
export const getAll = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM payments ORDER BY payment_date DESC`
    );
    return rows;
};

/* =========================
   GET BY USER ID (For Billing/Payment History in Flutter)
========================= */
export const getByUserId = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT * 
         FROM payments 
         WHERE user_id = ? 
         ORDER BY payment_date DESC`,
        [userId]
    );
    return rows;
};

/* =========================
   GET BY ID
========================= */
export const getById = async (paymentId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM payments WHERE payment_id = ?`,
        [paymentId]
    );
    return rows[0];
};

/* =========================
   RECORD A NEW PAYMENT
========================= */
export const create = async (data) => {
    // 🔹 Generate sequential alphanumeric key like PAY001, PAY002
    const [lastPayment] = await pool.execute(
        `SELECT payment_id FROM payments ORDER BY payment_date DESC LIMIT 1`
    );

    let nextNumber = 1;
    if (lastPayment.length > 0 && lastPayment[0].payment_id.startsWith("PAY")) {
        const lastIdNum = parseInt(lastPayment[0].payment_id.replace("PAY", ""), 10);
        if (!isNaN(lastIdNum)) {
            nextNumber = lastIdNum + 1;
        }
    }
    const customPaymentId = `PAY${String(nextNumber).padStart(3, "0")}`;

    const query = `
        INSERT INTO payments (
            payment_id, user_id, payment_method, amount
        ) VALUES (?, ?, ?, ?)
    `;

    const params = [
        customPaymentId,
        data.user_id,         // Integer or String linking to your users table
        data.payment_method,  // e.g., 'Cash on Delivery', 'Card Online', 'Bank Transfer'
        data.amount           // Decimal value (e.g., 150.00)
    ];

    const sanitizedParams = params.map(v => v === undefined ? null : v);

    await pool.execute(query, sanitizedParams);
    return { insertedId: customPaymentId };
};

/* =========================
   UPDATE BY ID (e.g., Correcting an entry typo)
========================= */
export const updateById = async (paymentId, fields) => {
    if (!fields || Object.keys(fields).length === 0) return false;

    // Allowed fields to update based on schema attributes
    const allowedFields = ["payment_method", "amount"];
    const setParts = [];
    const values = [];

    for (const [key, val] of Object.entries(fields)) {
        if (!allowedFields.includes(key)) continue;

        setParts.push(`\`${key}\` = ?`);
        values.push(val ?? null);
    }

    setParts.push("updated_at = CURRENT_TIMESTAMP");
    values.push(paymentId);

    const query = `
        UPDATE payments
        SET ${setParts.join(", ")}
        WHERE payment_id = ?
    `;

    const [result] = await pool.execute(query, values);
    return { affectedRows: result.affectedRows };
};

/* =========================
   DELETE BY ID (For removing transaction mistakes)
========================= */
export const deleteById = async (paymentId) => {
    const [result] = await pool.execute(
        `DELETE FROM payments WHERE payment_id = ?`,
        [paymentId]
    );

    return result.affectedRows > 0;
};