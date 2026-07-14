const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

//Sign up post

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
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

//login
router.post("/login", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ err: "Email and password are required ! " });
  }

  try {
    const findUser = await pool.query(`SELECT * FROM users WHERE email = $1 `, [
      email,
    ]);
    if (findUser.rows.length == 0) {
      res.status(401).json({ err: "Wrong credentials." });
    } else {
      const passwordsMatch = await bcrypt.compare(
        password,
        findUser.rows[0].password_hash,
      );
      if (!passwordsMatch) {
        return res.status(401).json({
          err: "Wrong credentials",
        });
      }
      const user = findUser.rows[0];
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      const { password_hash, ...safeUser } = findUser.rows[0];
      res.status(200).json({ user: safeUser, token });
    }
  } catch (err) {
    res.status(400).json({ err: "Error getting user! " });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id,email,name FROM users WHERE id = $1",
      [req.user.userId],
    );
    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

module.exports = router;
