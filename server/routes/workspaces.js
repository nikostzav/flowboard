const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const name = req.body.name;
  if (!name) {
    return res.status(400).json({ err: "Workspace name is required! " });
  }
  try {
    const newWorkspace = await pool.query(
      "INSERT INTO workspaces (name,owner_id) VALUES ($1,$2) RETURNING * ",
      [name, req.user.userId],
    );

    const workspace = newWorkspace.rows[0];

    await pool.query(
      "INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,$3)",
      [workspace.id, req.user.userId, "owner"],
    );
    res.status(201).json({ workspace });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

module.exports = router;
