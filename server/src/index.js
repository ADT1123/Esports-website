const express = require("express");
const cors = require("cors");

const teamsRouter = require("./routes/teams");
const fixturesRouter = require("./routes/fixtures");

const app = express();
const PORT = process.env.PORT || 4000;

// In dev, CLIENT_ORIGIN can be a single URL. In prod, allow the Vercel
// deployment plus localhost so testing never gets blocked by CORS.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/teams", teamsRouter);
app.use("/api/fixtures", fixturesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Ambiora esports API running on port ${PORT}`);
});
