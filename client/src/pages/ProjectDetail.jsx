import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../api/axios";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const location = useLocation();
  const projectName = location.state?.projectName;
  const workspaceId = location.state?.workspaceId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);

  const [taskTitle, setTasktitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [members, setMembers] = useState([]);
  const [assigneeId, setAssigneeId] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const result = await api.get(`/projects/${projectId}/tasks`);
        setTasks(result.data.tasks);
      } catch (err) {
        setError("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const result = await api.get(`/workspaces/${workspaceId}/members`);
        setMembers(result.data.members);
      } catch (err) {
        console.log(err);
      }
    };
    if (workspaceId) fetchMembers();
  }, [workspaceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;
    setCreating(true);
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        title: taskTitle,
        description,
        assignee_id: assigneeId || null,
      });

      setTasks((prev) => [...prev, response.data.task]);
      setTasktitle("");
      setDescription("");
      setAssigneeId("");
    } catch (err) {
      setError("Could not create task");
    } finally {
      setCreating(false);
    }
  };

  const getAssigneeName = (assigneeId) => {
    const member = members.find((m) => m.id === assigneeId);
    return member ? member.name : "Unassigned";
  };

  const toDoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div className="mb-4">
        <h2 className="mb-0">{projectName || "Project"}</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="text-center text-secondary py-5">
            <p className="mb-0">No tasks yet!</p>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="row g-3 mb-5 mt-3 ">
            <div className="col-md-4">
              <h6 className="text-secondary text-uppercase small mb-3">
                To Do
              </h6>
              {toDoTasks.map((t) => {
                return (
                  <div className="card shadow border mt-3" key={t.id}>
                    <div className="card-body">
                      <h5 className="card-title mb-1">{t.title}</h5>
                      <p className="card-text mt-2">
                        Description : {t.description}
                      </p>
                      <p className="card-text">
                        Asigned to : {getAssigneeName(t.assignee_id)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="col-md-4">
              <h6 className="text-secondary text-uppercase small mb-3">
                In Progress
              </h6>
              {inProgressTasks.map((t) => {
                return (
                  <div className="card shadow border mt-3" key={t.id}>
                    <div className="card-body">
                      <h5 className="cart-title mb-1">{t.title}</h5>
                      <p className="card-text">{t.description}</p>
                      <p className="card-text">
                        Asigned to : {getAssigneeName(t.assignee_id)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="col-md-4">
              <h6 className="text-secondary text-uppercase small mb-3">Done</h6>
              {doneTasks.map((t) => {
                return (
                  <div className="card shadow border mt-3" key={t.id}>
                    <div className="card-body">
                      <h5 className="cart-title mb-1">{t.title}</h5>
                      <p className="card-text">{t.description}</p>
                      <p className="card-text">
                        Asigned to : {getAssigneeName(t.assignee_id)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <hr className="my-4"></hr>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="cart-title mb-3">Create new Task</h6>
            <form onSubmit={handleSubmit} className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => {
                  setTasktitle(e.target.value);
                }}
              ></input>
              <input
                type="text"
                className="form-control"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></input>
              <select
                className="form-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary text-nowrap"
                type="submit"
                disabled={creating}
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
