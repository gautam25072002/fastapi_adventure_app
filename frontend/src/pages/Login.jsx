import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚔️ AI Adventure</h1>
        <p style={styles.subtitle}>Login to continue your journey</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.link}>
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a" },
  card: { background: "#1a1a2e", padding: "2rem", borderRadius: "12px", width: "360px", boxShadow: "0 0 30px rgba(99,102,241,0.2)" },
  title: { color: "#a78bfa", textAlign: "center", marginBottom: "0.25rem" },
  subtitle: { color: "#6b7280", textAlign: "center", marginBottom: "1.5rem", fontSize: "0.9rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  input: { padding: "0.75rem", borderRadius: "8px", border: "1px solid #374151", background: "#111827", color: "#fff", fontSize: "1rem" },
  button: { padding: "0.75rem", borderRadius: "8px", background: "#6d28d9", color: "#fff", border: "none", fontSize: "1rem", cursor: "pointer" },
  error: { color: "#f87171", textAlign: "center", marginBottom: "1rem" },
  link: { color: "#6b7280", textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }
};