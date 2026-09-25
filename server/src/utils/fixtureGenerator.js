const crypto = require("crypto");

// Single-elimination bracket for exactly 5 teams. Next power of two above 5
// is 8, so 3 teams get a first-round bye (they advance automatically) and
// only one round-1 match is actually played. From there it's a normal
// bracket: round 1 -> semifinals -> final.
function generateBracket(teamIds) {
  if (teamIds.length !== 5) {
    throw new Error("Bracket generator expects exactly 5 teams.");
  }

  // Shuffle so the bracket isn't the same shape every time you regenerate.
  const teams = [...teamIds];
  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }

  const id = () => crypto.randomUUID();

  const final = {
    id: id(),
    round: 3,
    label: "Final",
    slot: 0,
    teamA: null,
    teamB: null,
    winner: null,
    isBye: false,
    nextMatchId: null,
    nextSlot: null,
  };

  const sf1 = {
    id: id(),
    round: 2,
    label: "Semifinal 1",
    slot: 0,
    teamA: null,
    teamB: null,
    winner: null,
    isBye: false,
    nextMatchId: final.id,
    nextSlot: "A",
  };

  const sf2 = {
    id: id(),
    round: 2,
    label: "Semifinal 2",
    slot: 1,
    teamA: null,
    teamB: null,
    winner: null,
    isBye: false,
    nextMatchId: final.id,
    nextSlot: "B",
  };

  const r1m1 = {
    id: id(),
    round: 1,
    label: "Match 1",
    slot: 0,
    teamA: teams[0],
    teamB: teams[1],
    winner: null,
    isBye: false,
    nextMatchId: sf1.id,
    nextSlot: "A",
  };

  const r1m2 = {
    id: id(),
    round: 1,
    label: "Match 2",
    slot: 1,
    teamA: teams[2],
    teamB: null,
    winner: teams[2],
    isBye: true,
    nextMatchId: sf1.id,
    nextSlot: "B",
  };

  const r1m3 = {
    id: id(),
    round: 1,
    label: "Match 3",
    slot: 2,
    teamA: teams[3],
    teamB: null,
    winner: teams[3],
    isBye: true,
    nextMatchId: sf2.id,
    nextSlot: "A",
  };

  const r1m4 = {
    id: id(),
    round: 1,
    label: "Match 4",
    slot: 3,
    teamA: teams[4],
    teamB: null,
    winner: teams[4],
    isBye: true,
    nextMatchId: sf2.id,
    nextSlot: "B",
  };

  // Byes resolve immediately, so feed their winners into round 2 right away.
  sf1.teamB = r1m2.winner;
  sf2.teamA = r1m3.winner;
  sf2.teamB = r1m4.winner;

  return [r1m1, r1m2, r1m3, r1m4, sf1, sf2, final];
}

module.exports = { generateBracket };
