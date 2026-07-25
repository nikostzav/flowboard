import React from "react";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const [workspaces, setWorkpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await api.get("workspaces");
        setWorkpaces(response.data.workspaces);
      } catch (err) {
        setError("Could not load workspaces");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName) return;

    setCreating(true);
    try {
      const response = await api.post("/workspaces", {
        name: newWorkspaceName,
      });
      setWorkpaces((prev) => [...prev, response.data.workspace]);
      setNewWorkspaceName("");
    } catch (err) {
      setError("Could not create new Workspace");
    } finally {
      setCreating(false);
    }
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Your workspaces</h2>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && !error && workspaces.length === 0 && (
        <div className="text-center text-secondary py-5">
          <p className="mb-0">You don't belong to any workspaces yet.</p>
        </div>
      )}

      {!loading && workspaces.length > 0 && (
        <div className="row g-3 mb-5">
          {workspaces.map((ws) => (
            <div className="col-md-4" key={ws.id}>
              <Link
                to={`/workspaces/${ws.id}`}
                className="text-decoration-none text-dark"
                state={{ workspaceName: ws.name }}
              >
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="card-title mb-1">{ws.name}</h5>
                    <p className="card-text text-secondary small mb-0">
                      Workspace
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <hr className="my-4" />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6 className="card-title mb-3">Create a new workspace</h6>
          <form onSubmit={handleCreateWorkspace} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />
            <button
              className="btn btn-primary text-nowrap"
              type="submit"
              disabled={creating}
            >
              {creating ? "Adding..." : "Add workspace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
