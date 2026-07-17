require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const workspaceRoutes = require("./routes/workspaces");
app.use("/api/workspaces", workspaceRoutes);

const projectRoutes = require("./routes/projects");
app.use("/api/projects", projectRoutes);

const taskRoutes = require("./routes/tasks");
app.use("/api/projects/:project_id/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
