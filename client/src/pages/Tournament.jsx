import { useEffect, useState } from "react";
import { api } from "../api.js";
import TeamForm from "../components/TeamForm.jsx";
import PlayerForm from "../components/PlayerForm.jsx";
import TeamsGrid from "../components/TeamsGrid.jsx";
import FixtureBoard from "../components/FixtureBoard.jsx";
import "./Tournament.css";

const MAX_TEAMS = 5;
const MAX_PLAYERS = 5;

export default function Tournament() {
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function refreshAll() {
    setLoadError("");
    try {
      const [teamsData, fixturesData] = await Promise.all([
        api.getTeams(),
        api.getFixtures(),
      ]);
      setTeams(teamsData);
      setFixtures(fixturesData);
    } catch (err) {
      setLoadError(
        "Could not reach the server. If this is the first load, the API may still be waking up — try again in a few seconds."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const rosterComplete = teams.length === MAX_TEAMS && teams.every((t) => t.players.length === MAX_PLAYERS);

  if (loading) {
    return (
      <div className="tournament-page">
        <p className="tag">loading tournament data...</p>
      </div>
    );
  }

  return (
    <div className="tournament-page">
      <h1 className="page-title">Teams &amp; Fixtures</h1>
      <p className="page-sub">
        {teams.length}/{MAX_TEAMS} teams registered
      </p>

      {loadError && (
        <div className="panel">
          <p className="error-text">{loadError}</p>
          <button className="btn btn-small" onClick={refreshAll}>
            Retry
          </button>
        </div>
      )}

      <section className="setup-grid">
        <TeamForm
          teams={teams}
          maxTeams={MAX_TEAMS}
          onCreated={(team) => setTeams((prev) => [...prev, team])}
        />
        <PlayerForm
          teams={teams}
          maxPlayers={MAX_PLAYERS}
          onPlayerAdded={(teamId, player) =>
            setTeams((prev) =>
              prev.map((t) =>
                t.id === teamId ? { ...t, players: [...t.players, player] } : t
              )
            )
          }
        />
      </section>

      <div className="divider" />

      <TeamsGrid
        teams={teams}
        maxPlayers={MAX_PLAYERS}
        onTeamDeleted={(teamId) => {
          setTeams((prev) => prev.filter((t) => t.id !== teamId));
          setFixtures([]);
        }}
        onPlayerRemoved={(teamId, playerId) =>
          setTeams((prev) =>
            prev.map((t) =>
              t.id === teamId
                ? { ...t, players: t.players.filter((p) => p.id !== playerId) }
                : t
            )
          )
        }
      />

      <div className="divider" />

      <FixtureBoard
        teams={teams}
        fixtures={fixtures}
        rosterComplete={rosterComplete}
        onFixturesGenerated={setFixtures}
        onFixturesCleared={() => setFixtures([])}
        onWinnerSet={setFixtures}
      />
    </div>
  );
}
