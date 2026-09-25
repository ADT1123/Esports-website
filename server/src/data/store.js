// Very small JSON file "database". No ORM, no external DB — the whole
// tournament fits in one file and this app doesn't need more than that.

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

const EMPTY_STATE = {
  teams: [],
  fixtures: [],
};

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_STATE, null, 2));
    return structuredClone(EMPTY_STATE);
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    // If the file got corrupted somehow, don't crash the server — reset it.
    console.error("db.json could not be read, starting fresh:", err.message);
    fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_STATE, null, 2));
    return structuredClone(EMPTY_STATE);
  }
}

function save(state) {
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

module.exports = { load, save };
