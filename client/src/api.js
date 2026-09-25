// Small wrapper around fetch so components don't repeat error handling.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // 204 = No Content, nothing to parse
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong.");
  }

  return data;
}

export const api = {
  getTeams: () => request("/api/teams"),
  createTeam: (name) =>
    request("/api/teams", { method: "POST", body: JSON.stringify({ name }) }),
  deleteTeam: (teamId) =>
    request(`/api/teams/${teamId}`, { method: "DELETE" }),
  addPlayer: (teamId, player) =>
    request(`/api/teams/${teamId}/players`, {
      method: "POST",
      body: JSON.stringify(player),
    }),
  removePlayer: (teamId, playerId) =>
    request(`/api/teams/${teamId}/players/${playerId}`, { method: "DELETE" }),
  getFixtures: () => request("/api/fixtures"),
  generateFixtures: () => request("/api/fixtures/generate", { method: "POST" }),
  clearFixtures: () => request("/api/fixtures", { method: "DELETE" }),
  setWinner: (matchId, teamId) =>
    request(`/api/fixtures/${matchId}/winner`, {
      method: "POST",
      body: JSON.stringify({ teamId }),
    }),
};
