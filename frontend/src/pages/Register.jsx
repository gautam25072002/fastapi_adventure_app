import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#1a1a2e] rounded-2xl border border-[#2d2d44] p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚔️</div>
          <h1 className="text-2xl font-semibold text-violet-400">AI Adventure</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              Username
            </label>
            <input
              placeholder="Aryan"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="bg-[#111827] border border-[#374151] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-[#111827] border border-[#374151] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="bg-[#111827] border border-[#374151] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-violet-700 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-3 text-sm transition-colors mt-1"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}