const express = require("express");
const { load, save } = require("../data/store");
const { generateBracket } = require("../utils/fixtureGenerator");

const router = express.Router();

const REQUIRED_TEAMS = 5;
const REQUIRED_PLAYERS = 5;

router.get("/", (req, res) => {
  const state = load();
  res.json(state.fixtures);
});

router.post("/generate", (req, res) => {
  const state = load();

  if (state.teams.length !== REQUIRED_TEAMS) {
    return res.status(400).json({
      error: `You need exactly ${REQUIRED_TEAMS} teams before generating fixtures.`,
    });
  }

  const incomplete = state.teams.filter((t) => t.players.length !== REQUIRED_PLAYERS);
  if (incomplete.length > 0) {
    return res.status(400).json({
      error: `Every team needs ${REQUIRED_PLAYERS} players. Missing: ${incomplete
        .map((t) => t.name)
        .join(", ")}.`,
    });
  }

  const teamIds = state.teams.map((t) => t.id);
  state.fixtures = generateBracket(teamIds);
  save(state);

  res.status(201).json(state.fixtures);
});

// Record a winner for one match, then push that team into whatever match it
// feeds into next. If that next match had already been decided off the old
// (now-wrong) team, clear it and anything downstream of it too.
router.post("/:matchId/winner", (req, res) => {
  const { matchId } = req.params;
  const { teamId } = req.body;
  const state = load();

  const match = state.fixtures.find((f) => f.id === matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found." });
  }
  if (match.isBye) {
    return res.status(400).json({ error: "That slot was a bye — there's nothing to decide." });
  }
  if (!match.teamA || !match.teamB) {
    return res.status(400).json({ error: "Both teams for this match aren't set yet." });
  }
  if (![match.teamA, match.teamB].includes(teamId)) {
    return res.status(400).json({ error: "That team isn't in this match." });
  }

  const changed = match.winner !== teamId;
  match.winner = teamId;

  if (changed) propagate(state.fixtures, match);

  save(state);
  res.json(state.fixtures);
});

function propagate(fixtures, match) {
  if (!match.nextMatchId) return;
  const next = fixtures.find((f) => f.id === match.nextMatchId);
  if (!next) return;

  const slotKey = match.nextSlot === "A" ? "teamA" : "teamB";
  const incoming = match.winner; // null when we're clearing a stale result downstream

  if (next[slotKey] === incoming) return;
  next[slotKey] = incoming;

  if (next.winner) {
    next.winner = null;
    propagate(fixtures, next);
  }
}

router.delete("/", (req, res) => {
  const state = load();
  state.fixtures = [];
  save(state);
  res.status(204).end();
});

module.exports = router;
