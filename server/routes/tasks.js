const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.post("/", authMiddleware, async (req, res) => {
  const { project_id } = req.params;
  const { title, description, assignee_id, due_date } = req.body;
  if (!title) {
    return res.status(400).json({ err: "Title of project is required ! " });
  }

  try {
    const membership = await pool.query(
      `SELECT workspace_members.* FROM workspace_members
            JOIN projects ON projects.workspace_id = workspace_members.workspace_id
            WHERE projects.id = $1 AND workspace_members.user_id = $2`,
      [project_id, req.user.userId],
    );
    if (membership.rows.length === 0) {
      return res.status(403).json({ message: "No authorization" });
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id,title,description,assignee_id,due_date) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [project_id, title, description, assignee_id, due_date],
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Something went wrong !" });
  }
});

module.exports = router;
