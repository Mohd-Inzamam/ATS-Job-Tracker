import { useEffect, useState } from "react";

/**
 * CoachMark — a dismissable floating hint bubble.
 * Once dismissed, stored in localStorage under key `coach_${id}`.
 *
 * Props:
 *   id        — unique string key (persisted in localStorage)
 *   title     — bold heading text
 *   body      — description text
 *   show      — boolean — whether the trigger condition is met
 *   position  — "bottom" | "top" | "left" | "right" (default "bottom")
 *   delay     — ms before appearing (default 800)
 */
export default function CoachMark({
  id,
  title,
  body,
  show,
  position = "bottom",
  delay = 800,
}) {
  const storageKey = `coach_${id}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (localStorage.getItem(storageKey) === "dismissed") return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [show, storageKey, delay]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(storageKey, "dismissed");
  };

  if (!visible) return null;

  const arrowStyles = {
    bottom: {
      wrapper: {
        top: "calc(100% + 10px)",
        left: "50%",
        transform: "translateX(-50%)",
      },
      arrow: {
        top: -6,
        left: "50%",
        transform: "translateX(-50%)",
        borderBottom: "6px solid white",
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
      },
    },
    top: {
      wrapper: {
        bottom: "calc(100% + 10px)",
        left: "50%",
        transform: "translateX(-50%)",
      },
      arrow: {
        bottom: -6,
        left: "50%",
        transform: "translateX(-50%)",
        borderTop: "6px solid white",
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
      },
    },
    right: {
      wrapper: {
        left: "calc(100% + 10px)",
        top: "50%",
        transform: "translateY(-50%)",
      },
      arrow: {
        left: -6,
        top: "50%",
        transform: "translateY(-50%)",
        borderRight: "6px solid white",
        borderTop: "6px solid transparent",
        borderBottom: "6px solid transparent",
      },
    },
    left: {
      wrapper: {
        right: "calc(100% + 10px)",
        top: "50%",
        transform: "translateY(-50%)",
      },
      arrow: {
        right: -6,
        top: "50%",
        transform: "translateY(-50%)",
        borderLeft: "6px solid white",
        borderTop: "6px solid transparent",
        borderBottom: "6px solid transparent",
      },
    },
  };

  const pos = arrowStyles[position] || arrowStyles.bottom;

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 500,
        width: 260,
        ...pos.wrapper,
      }}>
      {/* Arrow */}
      <div
        style={{ position: "absolute", width: 0, height: 0, ...pos.arrow }}
      />

      {/* Card */}
      <div
        style={{
          background: "white",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 12,
          padding: "12px 14px",
          boxShadow: "0 8px 24px rgba(99,102,241,0.15)",
          animation: "coachPop 0.25s ease both",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "#0f172a",
            }}>
            ✦ {title}
          </p>
          <button
            onClick={dismiss}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
            aria-label="Dismiss">
            ×
          </button>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#475569",
            lineHeight: 1.5,
          }}>
          {body}
        </p>
        <button
          onClick={dismiss}
          style={{
            marginTop: 10,
            background: "rgba(99,102,241,0.08)",
            border: "none",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 12,
            color: "#6366f1",
            cursor: "pointer",
            fontWeight: 500,
          }}>
          Got it
        </button>
      </div>
    </div>
  );
}
