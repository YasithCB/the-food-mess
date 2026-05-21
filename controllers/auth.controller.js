const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
    const { name, mobile, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql =
        "INSERT INTO users (name, mobile, password) VALUES (?, ?, ?)";

    db.query(sql, [name, mobile, hashedPassword], (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        res.json({
            success: true,
            message: "User registered successfully",
        });
    });
};

exports.login = (req, res) => {
    const { mobile, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE mobile = ?",
        [mobile],
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "User Not Found! Check mobile Number",
                });
            }

            const user = results[0];
            const isMatch = bcrypt.compareSync(password, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Password!",
                });
            }

            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    mobile: user.mobile,
                },
            });
        }
    );
};
