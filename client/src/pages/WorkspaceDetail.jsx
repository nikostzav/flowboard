import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../api/axios";

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const workspaceName = location.state?.workspaceName;

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
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title mb-1">{project.name}</h5>
                  <p className="card-text text-secondary small mb-0">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
