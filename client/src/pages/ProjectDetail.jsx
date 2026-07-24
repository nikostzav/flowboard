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
    if(workspaceId) fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle) return ;
    setCreating(true)
    try{

    }catch(err){
      setError("Could not create task");
      
    }finally{
      setCreating(false)
    }
  };

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

        {!loading && tasks.length > 0 && <div></div>}

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
              <button
                className="btn btn-primary text-nowrap"
                type="submit"
                disabled={creating}
              >
                Add Task
              </button>
              {console.log(members)}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
