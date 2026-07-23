import React from "react";
import { useState, useEffect } from "react";
import api from "../api/axios";

function Dashboard() {
  const [workspaces, setWorkpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await api.get("workspaces");
        console.log(response.data);
        setWorkpaces(response.data.workspaces);
      } catch (err) {
        setError("Could not load workspaces");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);
  return (
    <div className="container mt-5">
      {loading && <p>Loading workspaces...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && workspaces.length === 0 && (
        <p>You don't belong to any workspaces yet.</p>
      )}
      {!loading &&
        workspaces.map((ws) => (
          <div key={ws.id} className="card p-3 mb-2">
            {ws.name}
          </div>
        ))}
    </div>
  );
}

export default Dashboard;
