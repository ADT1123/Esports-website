import { useEffect, useRef, useState } from "react";
import "./SplitFlapText.css";

// Departure-board style text cycler — each tile spins through a few random
// characters before settling on the real one, the way old airport/train
// boards flip between letters.

const CHARSETS = {
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numeric: "0123456789",
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
};

function randomChar(set) {
  return set[Math.floor(Math.random() * set.length)];
}

export default function SplitFlapText({
  words = [],
  flipDuration = 0.12,
  stagger = 0.06,
  cycleDelay = 2400,
  charset = "alphanumeric",
  flipsPerChar = 8,
  tileColor = "#111827",
  textColor = "#f8fafc",
  tileRadius = 8,
  gap = 6,
  fontSize = 52,
  loop = true,
  padTo = 0,
}) {
  const chars = CHARSETS[charset] || CHARSETS.alphanumeric;
  const width = padTo || words.reduce((max, w) => Math.max(max, w.length), 0);

  const pad = (w) => (w || "").toUpperCase().padEnd(width, " ").slice(0, width);

  const [display, setDisplay] = useState(() => pad(words[0]));
  const [flipTick, setFlipTick] = useState(() => Array(width).fill(0));
  const indexRef = useRef(0);
  const timers = useRef([]);

  useEffect(() => {
    if (words.length < 2) return undefined;

    function scheduleNext() {
      const nextIndex = (indexRef.current + 1) % words.length;
      if (!loop && nextIndex === 0) return;

      const target = pad(words[nextIndex]);

      for (let pos = 0; pos < width; pos++) {
        const posDelay = pos * stagger * 1000;
        for (let step = 0; step < flipsPerChar; step++) {
          const delay = posDelay + step * flipDuration * 1000;
          const timer = setTimeout(() => {
            const isFinal = step === flipsPerChar - 1;
            setDisplay((prev) => {
              const next = prev.split("");
              next[pos] = isFinal ? target[pos] : randomChar(chars);
              return next.join("");
            });
            setFlipTick((prev) => {
              const next = [...prev];
              next[pos] += 1;
              return next;
            });
          }, delay);
          timers.current.push(timer);
        }
      }

      indexRef.current = nextIndex;
      const cycleTime = width * stagger * 1000 + flipsPerChar * flipDuration * 1000;
      timers.current.push(setTimeout(scheduleNext, cycleTime + cycleDelay));
    }

    timers.current.push(setTimeout(scheduleNext, cycleDelay));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.join("\u0001"), flipDuration, stagger, cycleDelay, flipsPerChar, loop, width]);

  return (
    <div className="split-flap" style={{ gap: `${gap}px` }}>
      {display.split("").map((ch, i) => (
        <span
          key={i}
          className="split-flap-tile"
          style={{
            background: tileColor,
            borderRadius: `${tileRadius}px`,
            width: `${fontSize * 0.7}px`,
            height: `${fontSize * 1.15}px`,
          }}
        >
          <span
            key={flipTick[i]}
            className="split-flap-char"
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              animationDuration: `${flipDuration}s`,
            }}
          >
            {ch === " " ? " " : ch}
          </span>
        </span>
      ))}
    </div>
  );
}
