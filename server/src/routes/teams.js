const express = require("express");
const crypto = require("crypto");
const { load, save } = require("../data/store");

const router = express.Router();

const MAX_TEAMS = 5;
const MAX_PLAYERS_PER_TEAM = 5;

router.get("/", (req, res) => {
  const state = load();
  res.json(state.teams);
});

router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Team name is required." });
  }

  const state = load();

  if (state.teams.length >= MAX_TEAMS) {
    return res.status(400).json({ error: `Only ${MAX_TEAMS} teams are allowed.` });
  }

  const nameTaken = state.teams.some(
    (t) => t.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (nameTaken) {
    return res.status(400).json({ error: "A team with that name already exists." });
  }

  const team = {
    id: crypto.randomUUID(),
    name: name.trim(),
    players: [],
    createdAt: Date.now(),
  };

  state.teams.push(team);
  save(state);

  res.status(201).json(team);
});

router.delete("/:teamId", (req, res) => {
  const { teamId } = req.params;
  const state = load();

  const exists = state.teams.some((t) => t.id === teamId);
  if (!exists) {
    return res.status(404).json({ error: "Team not found." });
  }

  state.teams = state.teams.filter((t) => t.id !== teamId);
  // wipe fixtures too — they're only valid for a full 5-team roster
  state.fixtures = [];
  save(state);

  res.status(204).end();
});

router.post("/:teamId/players", (req, res) => {
  const { teamId } = req.params;
  const { name, ign, role } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Player name is required." });
  }

  const state = load();
  const team = state.teams.find((t) => t.id === teamId);

  if (!team) {
    return res.status(404).json({ error: "Team not found." });
  }

  if (team.players.length >= MAX_PLAYERS_PER_TEAM) {
    return res.status(400).json({ error: `${team.name} already has ${MAX_PLAYERS_PER_TEAM} players.` });
  }

  const player = {
    id: crypto.randomUUID(),
    name: name.trim(),
    ign: ign?.trim() || "",
    role: role?.trim() || "",
  };

  team.players.push(player);
  save(state);

  res.status(201).json(player);
});

router.delete("/:teamId/players/:playerId", (req, res) => {
  const { teamId, playerId } = req.params;
  const state = load();
  const team = state.teams.find((t) => t.id === teamId);

  if (!team) {
    return res.status(404).json({ error: "Team not found." });
  }

  const before = team.players.length;
  team.players = team.players.filter((p) => p.id !== playerId);

  if (team.players.length === before) {
    return res.status(404).json({ error: "Player not found." });
  }

  save(state);
  res.status(204).end();
});

module.exports = router;
