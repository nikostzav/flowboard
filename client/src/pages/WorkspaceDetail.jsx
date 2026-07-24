import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function WorkspaceDetail() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);

  const { workspaceId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const workspaceName = location.state?.workspaceName;

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMessage("");
    try {
      const response = await api.post(`/workspaces/${workspaceId}/members`, {
        email: inviteEmail,
      });
      setInviteMessage(`${response.data.member.name} added to workspace`);
      setInviteEmail("");
    } catch (err) {
      setInviteMessage(err.response?.data?.err || "Could not invite user.");
    } finally {
      setInviting(false);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const result = await api.get(`/projects/${workspaceId}`);
        setProjects(result.data.projects);
      } catch (err) {
        setError("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
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
    fetchMembers();
  }, []);
  const isOwner = members.find((m) => m.id === user?.id)?.role === "owner";
  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div className="mb-4">
        <h2 className="mb-0">{workspaceName || "Workspace"}</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-center text-secondary py-5">
          <p className="mb-0">No active projects right now !</p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="row g-3 mb-5">
          {projects.map((project) => (
            <div className="col-md-4" key={project.id}>
              <Link
                to={`/projects/${project.id}`}
                className="text-decoration-none text-dark"
                state={{ projectName: project.name, workspaceId: workspaceId }}
              >
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="card-title mb-1">{project.name}</h5>
                    <p className="card-text text-secondary small mb-0">
                      Created{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
      <hr className="my-4"></hr>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6 className="card-title mb-3">Add a user to the workspace!</h6>

          {!isOwner && (
            <p className="text-secondary small mb-2">
              Only the workspace owner can invite members.
            </p>
          )}

          <form onSubmit={handleInvite} className="d-flex gap-2">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={!isOwner}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!isOwner || inviting}
            >
              Invite
            </button>
          </form>

          {inviteMessage && <p className="mb-0 mt-2">{inviteMessage}</p>}
        </div>
      </div>
    </div>
  );
}
