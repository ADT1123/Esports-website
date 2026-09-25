import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import SplitFlapText from "../components/SplitFlapText.jsx";
import AimTrainer from "../components/AimTrainer.jsx";
import "./Landing.css";

export default function Landing() {
  const [stats, setStats] = useState({ teams: 0, players: 0, fixtures: 0 });

  useEffect(() => {
    // Best-effort — if the API is cold-starting (Render free tier) or down,
    // the hero still works fine with zeros.
    api
      .getTeams()
      .then((teams) => {
        const players = teams.reduce((sum, t) => sum + t.players.length, 0);
        setStats((s) => ({ ...s, teams: teams.length, players }));
      })
      .catch(() => {});

    api
      .getFixtures()
      .then((fixtures) => setStats((s) => ({ ...s, fixtures: fixtures.length })))
      .catch(() => {});
  }, []);

  return (
    <div className="landing">
      <section className="hero">
        <SplitFlapText
          words={["AGENTS READY", "BRACKET LIVE", "CLUTCH TIME"]}
          flipDuration={0.12}
          stagger={0.05}
          cycleDelay={2600}
          charset="alphanumeric"
          flipsPerChar={7}
          tileColor="#1a1a1a"
          textColor="#f4f1ea"
          tileRadius={4}
          gap={4}
          fontSize={20}
          loop
        />
        <h1 className="hero-title">VALORANT ESPORTS</h1>
        <p className="hero-sub">5 teams. 5 players each. One bracket.</p>
        <Link to="/tournament" className="btn">
          Enter Tournament
        </Link>
      </section>

      <div className="divider" />

      <section className="stats-strip">
        <div className="stat-block">
          <span className="stat-num">{stats.teams}/5</span>
          <span className="stat-label">Teams Registered</span>
        </div>
        <div className="stat-block">
          <span className="stat-num">{stats.players}/25</span>
          <span className="stat-label">Players Registered</span>
        </div>
        <div className="stat-block">
          <span className="stat-num">{stats.fixtures}</span>
          <span className="stat-label">Matches in Bracket</span>
        </div>
      </section>

      <div className="divider" />

      <section className="game-strip">
        <AimTrainer />
      </section>

      <div className="divider" />

      <section className="about-strip">
        <p>
          Register five teams, fill each roster, generate the bracket, and
          pick winners round by round until a champion comes out on top.
        </p>
      </section>
    </div>
  );
}
