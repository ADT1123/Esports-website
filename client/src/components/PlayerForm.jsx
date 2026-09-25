import { useState, useEffect } from "react";
import { api } from "../api.js";

const ROLES = ["IGL", "Entry", "Support", "Sniper", "Flex"];

export default function PlayerForm({ teams, maxPlayers, onPlayerAdded }) {
  const openTeams = teams.filter((t) => t.players.length < maxPlayers);
  const [teamId, setTeamId] = useState("");
  const [name, setName] = useState("");
  const [ign, setIgn] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Keep the selected team valid as the roster changes.
  useEffect(() => {
    if (openTeams.length === 0) {
      setTeamId("");
      return;
    }
    if (!openTeams.some((t) => t.id === teamId)) {
      setTeamId(openTeams[0].id);
    }
  }, [openTeams, teamId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!teamId || !name.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const player = await api.addPlayer(teamId, { name: name.trim(), ign: ign.trim(), role });
      onPlayerAdded(teamId, player);
      setName("");
      setIgn("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Add a Player</h2>
      {teams.length === 0 ? (
        <p className="tag">Register a team first.</p>
      ) : openTeams.length === 0 ? (
        <p className="tag">Every team has {maxPlayers} players.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="player-team">Team</label>
          <select id="player-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            {openTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.players.length}/{maxPlayers})
              </option>
            ))}
          </select>

          <div style={{ marginTop: 10 }}>
            <label htmlFor="player-name">Player name</label>
            <input
              id="player-name"
              type="text"
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label htmlFor="player-ign">In-game name</label>
            <input
              id="player-ign"
              type="text"
              value={ign}
              maxLength={20}
              onChange={(e) => setIgn(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label htmlFor="player-role">Role</label>
            <select id="player-role" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={submitting} style={{ marginTop: 12 }}>
            {submitting ? "Adding..." : "Add Player"}
          </button>
        </form>
      )}
    </div>
  );
}
