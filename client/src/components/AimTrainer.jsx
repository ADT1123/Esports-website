import { useCallback, useEffect, useRef, useState } from "react";
import "./AimTrainer.css";

const ROUNDS = 5;
const TARGET_SIZE = 34; // px
const BEST_KEY = "valorant-esports-aim-best";

function randomSpawnDelay() {
  return 350 + Math.random() * 700;
}

function randomPosition(width, height) {
  const pad = TARGET_SIZE;
  return {
    x: pad + Math.random() * (width - pad * 2),
    y: pad + Math.random() * (height - pad * 2),
  };
}

export default function AimTrainer() {
  const arenaRef = useRef(null);
  const spawnTimer = useRef(null);
  const spawnedAt = useRef(0);

  const [status, setStatus] = useState("idle"); // idle | waiting | live | done
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(null);
  const [times, setTimes] = useState([]);
  const [best, setBest] = useState(() => {
    try {
      const stored = localStorage.getItem(BEST_KEY);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });

  const clearSpawnTimer = useCallback(() => {
    if (spawnTimer.current) {
      clearTimeout(spawnTimer.current);
      spawnTimer.current = null;
    }
  }, []);

  const spawnTarget = useCallback(() => {
    const el = arenaRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setStatus("waiting");
    spawnTimer.current = setTimeout(() => {
      setTarget(randomPosition(width, height));
      setStatus("live");
      spawnedAt.current = performance.now();
    }, randomSpawnDelay());
  }, []);

  const start = useCallback(() => {
    setTimes([]);
    setRound(0);
    setTarget(null);
    spawnTarget();
  }, [spawnTarget]);

  const handleHit = useCallback(
    (e) => {
      e.stopPropagation();
      if (status !== "live") return;
      const reaction = Math.round(performance.now() - spawnedAt.current);
      const nextTimes = [...times, reaction];
      setTimes(nextTimes);
      setTarget(null);

      const nextRound = round + 1;
      setRound(nextRound);

      if (nextRound >= ROUNDS) {
        setStatus("done");
        const avg = Math.round(nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length);
        if (best === null || avg < best) {
          setBest(avg);
          try {
            localStorage.setItem(BEST_KEY, String(avg));
          } catch {
            // ignore — private browsing etc.
          }
        }
      } else {
        spawnTarget();
      }
    },
    [status, times, round, best, spawnTarget]
  );

  useEffect(() => clearSpawnTimer, [clearSpawnTimer]);

  const average =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  return (
    <div className="panel aim-trainer">
      <div className="aim-trainer-header">
        <h2 className="panel-title">Reflex Check</h2>
        <span className="tag">
          {status === "done"
            ? `avg ${average}ms`
            : status === "idle"
            ? "click start"
            : `round ${Math.min(round + 1, ROUNDS)}/${ROUNDS}`}
        </span>
      </div>

      <div ref={arenaRef} className="aim-arena">
        {status === "idle" && (
          <div className="aim-overlay">
            <p>5 targets. React fast.</p>
            <button className="btn btn-small" onClick={start}>
              Start
            </button>
          </div>
        )}

        {status === "done" && (
          <div className="aim-overlay">
            <p>
              Average <strong>{average}ms</strong>
              {best !== null && <span className="aim-best"> — best {best}ms</span>}
            </p>
            <button className="btn btn-small" onClick={start}>
              Retry
            </button>
          </div>
        )}

        {target && (
          <button
            className="aim-target"
            style={{ left: target.x, top: target.y }}
            onClick={handleHit}
            aria-label="target"
          />
        )}
      </div>
    </div>
  );
}
