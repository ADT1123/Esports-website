import { api } from "../api.js";
import "./TeamsGrid.css";

export default function TeamsGrid({ teams, maxPlayers, onTeamDeleted, onPlayerRemoved }) {
  if (teams.length === 0) {
    return (
      <section>
        <h2 className="panel-title">Teams</h2>
        <p className="tag">No teams registered yet.</p>
      </section>
    );
  }

  async function handleDeleteTeam(teamId) {
    if (!window.confirm("Remove this team? Fixtures will be cleared too.")) return;
    await api.deleteTeam(teamId);
    onTeamDeleted(teamId);
  }

  async function handleRemovePlayer(teamId, playerId) {
    await api.removePlayer(teamId, playerId);
    onPlayerRemoved(teamId, playerId);
  }

  return (
    <section>
      <h2 className="panel-title">Teams</h2>
      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card panel">
            <div className="team-card-header">
              <h3>{team.name}</h3>
              <button className="btn-text" onClick={() => handleDeleteTeam(team.id)} title="Remove team">
                ✕
              </button>
            </div>
            <p className="tag">
              {team.players.length}/{maxPlayers} players
            </p>
            <ul className="roster-list">
              {team.players.map((p) => (
                <li key={p.id}>
                  <span>
                    {p.name}
                    {p.ign && <span className="roster-ign"> "{p.ign}"</span>}
                  </span>
                  <span className="roster-role">{p.role || "—"}</span>
                  <button
                    className="btn-text"
                    onClick={() => handleRemovePlayer(team.id, p.id)}
                    title="Remove player"
                  >
                    ✕
                  </button>
                </li>
              ))}
              {team.players.length === 0 && <li className="tag">empty roster</li>}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
