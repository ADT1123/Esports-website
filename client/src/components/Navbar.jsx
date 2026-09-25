import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        VALORANT<span>ESPORTS</span>
      </NavLink>
      <nav className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/tournament"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Teams &amp; Fixtures
        </NavLink>
      </nav>
    </header>
  );
}
