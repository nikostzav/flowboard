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

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT workspaces.* FROM workspaces
     JOIN workspace_members ON workspaces.id = workspace_members.workspace_id
     WHERE workspace_members.user_id = $1`,
      [req.user.userId],
    );
    res.status(200).json({ workspaces: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Something went wrong." });
  }
});

//get users that are part of a workspace
router.get("/:workspace_id/members", authMiddleware, async (req, res) => {
  const { workspace_id } = req.params;

  //there is something wrong in the membership chunk it is not working properly
  try {
    const membership = await pool.query(
      "SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspace_id, req.user.userId],
    );
    if (membership.rows.length === 0) {
      return res
        .status(403)
        .json({ err: "You are not member of this workspace !" });
    }

    const result = await pool.query(
      "SELECT users.id,users.name,workspace_members.role FROM workspace_members JOIN users ON workspace_members.user_id = users.id WHERE workspace_members.workspace_id = $1 ORDER BY users.name ASC",
      [workspace_id],
    );

    console.log("workspace_id:", workspace_id, "userId:", req.user.userId);

    res.status(200).json({ members: result.rows });
  } catch (error) {
    console.log(err);
    res.status(500).json({ err: "Something went wrong!" });
  }
});

router.post("/:workspace_id/members", authMiddleware, async (req, res) => {
  const { workspace_id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ err: "Email is required" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2 AND role = 'owner'`,
      [workspace_id, req.user.userId],
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ err: "Only the owner can invite members" });
    }
    const inviteUser = await pool.query(
      `SELECT id,name FROM users WHERE  email = $1`,
      [email],
    );
    if (inviteUser.rows.length === 0) {
      return res.status(404).json({ err: "No user with that email" });
    }
    const alreadyMember = await pool.query(
      `SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [workspace_id, inviteUser.rows[0].id],
    );
    if (alreadyMember.rows.length > 0) {
      res.status(409).json({ err: "This user is already a member" });
    }
    const newMember = await pool.query(
      `INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,'member') RETURNING *`,
      [workspace_id, inviteUser.rows[0].id],
    );
    res.status(201).json({
      member: { id: inviteUser.rows[0].id, name: inviteUser.rows[0].name },
    });
  } catch (err) {
    console.log("Something went wrong!");
    res.status(500).json({ err: "Something went wrong!" });
  }
});

module.exports = router;
