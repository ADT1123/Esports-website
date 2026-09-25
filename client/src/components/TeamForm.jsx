import { useState } from "react";
import { api } from "../api.js";

export default function TeamForm({ teams, maxTeams, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const full = teams.length >= maxTeams;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const team = await api.createTeam(name.trim());
      onCreated(team);
      setName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Register a Team</h2>
      {full ? (
        <p className="tag">All {maxTeams} team slots are filled.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="team-name">Team name</label>
          <input
            id="team-name"
            type="text"
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Crimson Wolves"
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={submitting} style={{ marginTop: 12 }}>
            {submitting ? "Adding..." : "Add Team"}
          </button>
        </form>
      )}
    </div>
  );
}
