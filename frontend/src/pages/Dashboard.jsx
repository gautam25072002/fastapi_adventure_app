import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startAdventure, getSessions, deleteSession } from "../services/api";

const GENRES = ["Fantasy", "Horror", "Sci-Fi", "Mystery"];
const CLASSES = ["Warrior", "Mage", "Rogue", "Explorer"];

const GENRE_ICONS = {
  Fantasy: "⚔️",
  Horror: "💀",
  "Sci-Fi": "🚀",
  Mystery: "🔍",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [form, setForm] = useState({
    genre: "Fantasy",
    setting: "",
    character_name: "",
    character_class: "Warrior",
  });

  useEffect(() => {
    getSessions()
      .then((res) => setSessions(res.data))
      .finally(() => setSessionsLoading(false));
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

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation(); // prevent navigating to game page
    if (!confirm("Delete this adventure?")) return;
    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (err) {
      alert("Failed to delete adventure");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Navbar */}
      <div className="border-b border-[#2d2d44] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔️</span>
          <span className="text-violet-400 font-semibold text-lg">
            AI Adventure
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm border border-[#374151] hover:border-gray-500 px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* New Adventure Form */}
        <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d44] p-6">
          <h2 className="text-violet-400 font-semibold text-lg mb-6">
            Start New Adventure
          </h2>

          <form onSubmit={handleStart} className="flex flex-col gap-5">
            {/* Genre selector */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                Genre
              </label>
              <div className="grid grid-cols-4 gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, genre: g })}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm transition-all ${
                      form.genre === g
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-[#374151] bg-[#111827] text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <span className="text-lg">{GENRE_ICONS[g]}</span>
                    <span>{g}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Character class selector */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                Character Class
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CLASSES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, character_class: c })}
                    className={`py-2.5 rounded-xl border text-sm transition-all ${
                      form.character_class === c
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-[#374151] bg-[#111827] text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Character name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                Character Name
              </label>
              <input
                placeholder="e.g. Aryan"
                value={form.character_name}
                onChange={(e) =>
                  setForm({ ...form, character_name: e.target.value })
                }
                required
                className="bg-[#111827] border border-[#374151] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Setting */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                Setting
              </label>
              <input
                placeholder="e.g. dark enchanted forest, abandoned space station"
                value={form.setting}
                onChange={(e) => setForm({ ...form, setting: e.target.value })}
                required
                className="bg-[#111827] border border-[#374151] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-violet-700 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 text-sm transition-colors mt-1"
            >
              {loading ? "Generating your story..." : "⚔️ Begin Adventure"}
            </button>
          </form>
        </div>

        {/* Past Adventures */}
        {sessionsLoading ? (
          <p className="text-gray-500 text-sm text-center">
            Loading past adventures...
          </p>
        ) : sessions.length > 0 ? (
          <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d44] p-6">
            <h2 className="text-violet-400 font-semibold text-lg mb-5">
              Past Adventures
            </h2>
            <div className="flex flex-col gap-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/game/${s.id}`)}
                  className="flex items-center justify-between bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#374151] rounded-xl px-4 py-3.5 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {GENRE_ICONS[
                        s.genre.charAt(0).toUpperCase() + s.genre.slice(1)
                      ] || "⚔️"}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium capitalize">
                        {s.character_name} the {s.character_class}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5 capitalize">
                        {s.genre} · {s.setting}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${
                        s.status === "active"
                          ? "bg-violet-500/20 text-violet-300"
                          : "bg-gray-700/50 text-gray-400"
                      }`}
                    >
                      {s.status}
                    </span>

                    {/* Delete button — only shows on hover */}
                    <button
                      onClick={(e) => handleDelete(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-400/10"
                      title="Delete adventure"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"></path>
                        <path d="M10 11v6M14 11v6"></path>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
