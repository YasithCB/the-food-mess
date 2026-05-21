import { pool } from "../db.js";

/* =========================
   GET ALL USERS
========================= */
export const getAll = async () => {
    const [rows] = await pool.execute(
        `SELECT id, name, mobile, created_at FROM users ORDER BY created_at DESC`
    );
    return rows;
};

/* =========================
   GET BY ID
========================= */
export const getById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT id, name, mobile, created_at FROM users WHERE id = ?`,
        [id]
    );
    return rows[0];
};

/* =========================
   GET BY MOBILE (Essential for Auth Login and Call-ins)
========================= */
export const getByMobile = async (mobile) => {
    const [rows] = await pool.execute(
        `SELECT * FROM users WHERE mobile = ?`,
        [mobile]
    );
    return rows[0];
};

/* =========================
   CREATE USER (Registration / Admin Panel addition)
========================= */
export const create = async (data) => {
    const query = `
        INSERT INTO users (
            name, mobile, password
        ) VALUES (?, ?, ?)
    `;

    const params = [
        data.name || null,
        data.mobile || null,
        data.password || null // Ensure this is hashed (e.g., bcrypt) before passing to model
    ];

    const sanitizedParams = params.map(v => v === undefined ? null : v);

    const [result] = await pool.execute(query, sanitizedParams);
    return { insertedId: result.insertId }; // Returns the auto-incremented INT id
};

/* =========================
   UPDATE BY ID
========================= */
export const updateById = async (id, fields) => {
    if (!fields || Object.keys(fields).length === 0) return false;

    // Allowed updatable fields based on your schema
    const allowedFields = ["name", "mobile", "password"];
    const setParts = [];
    const values = [];

    for (const [key, val] of Object.entries(fields)) {
        if (!allowedFields.includes(key)) continue;

        setParts.push(`\`${key}\` = ?`);
        values.push(val ?? null);
    }

    // Since your schema doesn't have an updated_at column,
    // we only target the specific fields updated
    values.push(id);

    const query = `
        UPDATE users
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
        `DELETE FROM users WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
};