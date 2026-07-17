const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { workspace_id, name, description } = req.body;

  if (!workspace_id || !name) {
    return res.status(400).json({ err: "workspace_id and name are required." });
  }

  try {
    const membership = await pool.query(
      "SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspace_id, req.user.userId],
    );

    if (membership.rows.length === 0) {
      return res
        .status(403)
        .json({ err: "You are not a member of this workspace." });
    }

    // your INSERT INTO projects goes here — use RETURNING * like you did for workspaces
    // then res.status(201).json({ project: ... })
    const project = await pool.query(
      "INSERT INTO projects (workspace_id,name,description) VALUES ($1,$2,$3) RETURNING *",
      [workspace_id, name, description ? description : null],
    );
    res.status(201).json({ project: project.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Something went wrong." });
  }
});

router.get("/:workspace_id", authMiddleware, async (req, res) => {
  const { workspace_id } = req.params;
  // request the projects for the worskpace
  try {
    const membership = await pool.query(
      "SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspace_id, req.user.userId],
    );
    if (membership.rows.length === 0) {
      return res.status(403).json({ message: "No access to this project!" });
    }

    const result = await pool.query(
      "SELECT * FROM projects where workspace_id = $1",
      [workspace_id],
    );
    res.status(200).json({ projects: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

module.exports = router;
