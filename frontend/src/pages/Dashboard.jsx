import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startAdventure, getSessions } from "../services/api";

const GENRES = ["Fantasy", "Horror", "Sci-Fi", "Mystery"];
const CLASSES = ["Warrior", "Mage", "Rogue", "Explorer"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    genre: "Fantasy",
    setting: "",
    character_name: "",
    character_class: "Warrior",
  });

  useEffect(() => {
    getSessions().then((res) => setSessions(res.data));
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await startAdventure({
        ...form,
        genre: form.genre.toLowerCase(),
        character_class: form.character_class.toLowerCase(),
      });
      navigate(`/game/${res.data.session.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to start adventure");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚔️ AI Adventure</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* New Adventure Form */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Start New Adventure</h2>
        <form onSubmit={handleStart} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Genre</label>
              <select style={styles.input} value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Character Class</label>
              <select style={styles.input} value={form.character_class} onChange={(e) => setForm({ ...form, character_class: e.target.value })}>
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Character Name</label>
            <input
              style={styles.input}
              placeholder="e.g. Aryan"
              value={form.character_name}
              onChange={(e) => setForm({ ...form, character_name: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Setting</label>
            <input
              style={styles.input}
              placeholder="e.g. dark enchanted forest, abandoned space station"
              value={form.setting}
              onChange={(e) => setForm({ ...form, setting: e.target.value })}
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Generating your story..." : "⚔️ Begin Adventure"}
          </button>
        </form>
      </div>

      {/* Past Adventures */}
      {sessions.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Past Adventures</h2>
          <div style={styles.sessionList}>
            {sessions.map((s) => (
              <div key={s.id} style={styles.sessionItem} onClick={() => navigate(`/game/${s.id}`)}>
                <div>
                  <p style={styles.sessionTitle}>{s.character_name} the {s.character_class}</p>
                  <p style={styles.sessionSub}>{s.genre} · {s.setting}</p>
                </div>
                <span style={{ ...styles.badge, background: s.status === "active" ? "#6d28d9" : "#374151" }}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#0f0f1a", padding: "2rem", color: "#fff" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" },
  title: { color: "#a78bfa", margin: 0 },
  logoutBtn: { background: "transparent", border: "1px solid #374151", color: "#9ca3af", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" },
  card: { background: "#1a1a2e", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", maxWidth: "700px", margin: "0 auto 1.5rem" },
  cardTitle: { color: "#a78bfa", marginBottom: "1.25rem", marginTop: 0 },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  row: { display: "flex", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 },
  label: { color: "#9ca3af", fontSize: "0.85rem" },
  input: { padding: "0.75rem", borderRadius: "8px", border: "1px solid #374151", background: "#111827", color: "#fff", fontSize: "1rem" },
  button: { padding: "0.85rem", borderRadius: "8px", background: "#6d28d9", color: "#fff", border: "none", fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" },
  sessionList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  sessionItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#111827", borderRadius: "8px", cursor: "pointer", border: "1px solid #1f2937" },
  sessionTitle: { margin: 0, fontWeight: 600 },
  sessionSub: { margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.85rem", textTransform: "capitalize" },
  badge: { padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", textTransform: "capitalize" }
};