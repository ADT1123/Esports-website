import { useState } from "react";
import { api } from "../api.js";
import "./FixtureBoard.css";

const ROUND_NAMES = { 1: "Round 1", 2: "Semifinals", 3: "Final" };

function chunkPairs(list) {
  const pairs = [];
  for (let i = 0; i < list.length; i += 2) {
    pairs.push(list.slice(i, i + 2));
  }
  return pairs;
}

function Match({ match, teamName, onPick, disabled }) {
  const nameA = match.teamA ? teamName(match.teamA) : match.isBye ? null : "TBD";
  const nameB = match.isBye ? "BYE" : match.teamB ? teamName(match.teamB) : "TBD";

  const decided = Boolean(match.winner);
  const clickable = !match.isBye && match.teamA && match.teamB && !disabled;

  return (
    <div className={`bracket-match${match.isBye ? " is-bye" : ""}`}>
      <button
        type="button"
        className={`bracket-team${match.winner === match.teamA ? " is-winner" : ""}${
          decided && match.winner !== match.teamA ? " is-loser" : ""
        }`}
        disabled={!clickable}
        onClick={() => clickable && onPick(match, match.teamA)}
      >
        {nameA || "TBD"}
      </button>
      <button
        type="button"
        className={`bracket-team${match.winner === match.teamB ? " is-winner" : ""}${
          decided && match.winner !== match.teamB && !match.isBye ? " is-loser" : ""
        }${match.isBye ? " is-bye-slot" : ""}`}
        disabled={!clickable}
        onClick={() => clickable && match.teamB && onPick(match, match.teamB)}
      >
        {nameB}
      </button>
    </div>
  );
}

export default function FixtureBoard({
  teams,
  fixtures,
  rosterComplete,
  onFixturesGenerated,
  onFixturesCleared,
  onWinnerSet,
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const teamName = (id) => teams.find((t) => t.id === id)?.name || "Unknown";

  async function handleGenerate() {
    setBusy(true);
    setError("");
    try {
      const data = await api.generateFixtures();
      onFixturesGenerated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    if (!window.confirm("Clear the current bracket?")) return;
    setBusy(true);
    try {
      await api.clearFixtures();
      onFixturesCleared();
    } finally {
      setBusy(false);
    }
  }

  async function handlePick(match, teamId) {
    setBusy(true);
    setError("");
    try {
      const updated = await api.setWinner(match.id, teamId);
      onWinnerSet(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const rounds = fixtures.reduce((map, f) => {
    map[f.round] = map[f.round] || [];
    map[f.round].push(f);
    return map;
  }, {});
  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);
  const lastRound = roundNumbers[roundNumbers.length - 1];
  const final = rounds[lastRound]?.[0];
  const champion = final && !final.isBye && final.winner ? teamName(final.winner) : null;

  return (
    <section>
      <div className="fixture-header">
        <h2 className="panel-title">Bracket</h2>
        <div className="fixture-actions">
          {fixtures.length > 0 && (
            <button className="btn btn-outline btn-small" onClick={handleClear} disabled={busy}>
              Clear
            </button>
          )}
          <button className="btn" onClick={handleGenerate} disabled={busy || !rosterComplete}>
            {fixtures.length > 0 ? "Regenerate" : "Generate Bracket"}
          </button>
        </div>
      </div>

      {!rosterComplete && (
        <p className="tag">Fill all 5 teams with 5 players each to unlock the bracket.</p>
      )}
      {error && <p className="error-text">{error}</p>}

      {fixtures.length > 0 && (
        <>
          <div className="bracket-scroll">
            <div className="bracket">
              {roundNumbers.map((round) => {
                const matches = [...rounds[round]].sort((a, b) => a.slot - b.slot);
                const isFinalRound = round === lastRound;
                return (
                  <div className="bracket-round" key={round}>
                    <span className="bracket-round-label">
                      {ROUND_NAMES[round] || `Round ${round}`}
                    </span>
                    <div className="bracket-round-body">
                      {isFinalRound
                        ? matches.map((m) => (
                            <Match
                              key={m.id}
                              match={m}
                              teamName={teamName}
                              onPick={handlePick}
                              disabled={busy}
                            />
                          ))
                        : chunkPairs(matches).map((pair, i) => (
                            <div className="bracket-pair" key={i}>
                              {pair.map((m) => (
                                <Match
                                  key={m.id}
                                  match={m}
                                  teamName={teamName}
                                  onPick={handlePick}
                                  disabled={busy}
                                />
                              ))}
                            </div>
                          ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {champion && (
            <div className="bracket-champion">
              <span className="tag">Champion</span>
              <span className="bracket-champion-name">{champion}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
