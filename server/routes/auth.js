const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if ((!email, !password, !name)) {
    return res
      .status(400)
      .json({ error: "Email password and username are required ! " });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email,password_hash,name) VALUES ($1,$2,$3) RETURNING id,email,name",
      [email, passwordHash, name],
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong.Try again!" });
  }
});

module.exports = router;
