import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, makeChoice } from "../services/api";

export default function Game() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    getSession(sessionId)
      .then((res) => setState(res.data))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state]);

  const handleChoice = async (choice) => {
    setChoosing(true);
    try {
      const res = await makeChoice(sessionId, choice);
      setState(res.data);
    } catch (err) {
      alert("Something went wrong, try again");
    } finally {
      setChoosing(false);
    }
  };

  if (loading) return (
    <div style={styles.center}>
      <p style={{ color: "#a78bfa" }}>Loading your adventure...</p>
    </div>
  );

  if (!state) return (
    <div style={styles.center}>
      <p style={{ color: "#f87171" }}>Adventure not found.</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Dashboard
        </button>
        <div style={styles.meta}>
          <span style={styles.metaText}>
            {state.session.character_name} the {state.session.character_class}
          </span>
          <span style={styles.metaDot}>·</span>
          <span style={styles.metaText}>{state.session.genre}</span>
          <span style={styles.metaDot}>·</span>
          <span style={styles.metaText}>Turn {state.turn_number}</span>
        </div>
      </div>

      {/* Story */}
      <div style={styles.storyBox}>
        <p style={styles.storyText}>{state.current_story}</p>
      </div>

      {/* Ended screen */}
      {state.is_ended ? (
        <div style={styles.endBox}>
          <h2 style={styles.endTitle}>⚔️ Adventure Complete</h2>
          <p style={styles.endSub}>
            Your journey ended after {state.turn_number} turns.
          </p>
          <button
            style={styles.button}
            onClick={() => navigate("/dashboard")}
          >
            Start New Adventure
          </button>
        </div>
      ) : (
        /* Choices */
        <div style={styles.choicesBox}>
          <p style={styles.choiceLabel}>What do you do?</p>
          <div style={styles.choices}>
            {state.choices.map((choice, i) => (
              <button
                key={i}
                style={styles.choiceBtn}
                onClick={() => handleChoice(`Choice ${i + 1}`)}
                disabled={choosing}
              >
                {choosing ? "..." : `${i + 1}. ${choice}`}
              </button>
            ))}
          </div>
          {choosing && (
            <p style={styles.generating}>✨ Generating next scene...</p>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#0f0f1a", color: "#fff", padding: "1.5rem", maxWidth: "720px", margin: "0 auto" },
  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a" },
  header: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" },
  backBtn: { background: "transparent", border: "1px solid #374151", color: "#9ca3af", padding: "0.4rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem" },
  meta: { display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" },
  metaText: { color: "#a78bfa", fontSize: "0.9rem", textTransform: "capitalize" },
  metaDot: { color: "#4b5563" },
  storyBox: { background: "#1a1a2e", borderRadius: "12px", padding: "1.75rem", marginBottom: "1.5rem", border: "1px solid #2d2d44", lineHeight: 1.8 },
  storyText: { color: "#e5e7eb", margin: 0, fontSize: "1.05rem" },
  choicesBox: { background: "#1a1a2e", borderRadius: "12px", padding: "1.5rem", border: "1px solid #2d2d44" },
  choiceLabel: { color: "#9ca3af", marginBottom: "1rem", marginTop: 0, fontSize: "0.9rem" },
  choices: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  choiceBtn: { padding: "0.9rem 1.25rem", borderRadius: "8px", background: "#111827", color: "#e5e7eb", border: "1px solid #374151", fontSize: "0.95rem", cursor: "pointer", textAlign: "left" },
  generating: { color: "#a78bfa", marginTop: "1rem", textAlign: "center", fontSize: "0.9rem" },
  endBox: { background: "#1a1a2e", borderRadius: "12px", padding: "2rem", border: "1px solid #6d28d9", textAlign: "center" },
  endTitle: { color: "#a78bfa", marginTop: 0 },
  endSub: { color: "#9ca3af", marginBottom: "1.5rem" },
  button: { padding: "0.85rem 2rem", borderRadius: "8px", background: "#6d28d9", color: "#fff", border: "none", fontSize: "1rem", cursor: "pointer" }
};