import { useEffect, useState } from "react";
import { api } from "../api.js";
import TeamForm from "../components/TeamForm.jsx";
import PlayerForm from "../components/PlayerForm.jsx";
import TeamsGrid from "../components/TeamsGrid.jsx";
import FixtureBoard from "../components/FixtureBoard.jsx";
import { DEMO_TEAMS } from "../demoData.js";
import "./Tournament.css";

const MAX_TEAMS = 5;
const MAX_PLAYERS = 5;

export default function Tournament() {
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState("");

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

  // Fills the site with a sample 5-team roster so the bracket can be tried
  // without typing 25 players by hand. Only offered while the tournament is
  // empty — it uses the same create-team/add-player endpoints a real entry
  // would, so there's nothing special-cased about the data once it's in.
  async function loadDemoData() {
    setSeeding(true);
    setSeedError("");
    try {
      for (const demoTeam of DEMO_TEAMS) {
        const team = await api.createTeam(demoTeam.name);
        setTeams((prev) => [...prev, team]);

        for (const demoPlayer of demoTeam.players) {
          const player = await api.addPlayer(team.id, demoPlayer);
          setTeams((prev) =>
            prev.map((t) =>
              t.id === team.id ? { ...t, players: [...t.players, player] } : t
            )
          );
        }
      }
    } catch (err) {
      setSeedError(err.message);
    } finally {
      setSeeding(false);
    }
  }

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
      <div className="page-sub-row">
        <p className="page-sub">
          {teams.length}/{MAX_TEAMS} teams registered
        </p>
        {teams.length === 0 && (
          <button className="btn-text-link" onClick={loadDemoData} disabled={seeding}>
            {seeding ? "loading demo data..." : "load demo data"}
          </button>
        )}
      </div>
      {seedError && <p className="error-text">{seedError}</p>}

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
