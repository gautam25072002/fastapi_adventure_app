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
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <p className="text-violet-400 animate-pulse">Loading your adventure...</p>
    </div>
  );

  if (!state) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <p className="text-red-400">Adventure not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">

      {/* Navbar */}
      <div className="border-b border-[#2d2d44] px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          ← Dashboard
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-violet-400 capitalize font-medium">
            {state.session.character_name}
          </span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-400 capitalize">{state.session.genre}</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-500">Turn {state.turn_number}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Story box */}
        <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d44] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
            <span className="text-violet-400 text-xs font-medium uppercase tracking-wide">
              {state.is_ended ? "The End" : `Turn ${state.turn_number}`}
            </span>
          </div>
          <p className="text-gray-200 leading-8 text-[15px]">
            {state.current_story}
          </p>
        </div>

        {/* Ended screen */}
        {state.is_ended ? (
          <div className="bg-[#1a1a2e] rounded-2xl border border-violet-500/30 p-8 text-center flex flex-col items-center gap-4">
            <div className="text-5xl">🏆</div>
            <h2 className="text-violet-400 text-xl font-semibold">
              Adventure Complete
            </h2>
            <p className="text-gray-400 text-sm">
              Your journey ended after {state.turn_number} turns.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-violet-700 hover:bg-violet-600 text-white font-medium rounded-xl px-8 py-3 text-sm transition-colors mt-2"
            >
              Start New Adventure
            </button>
          </div>
        ) : (
          /* Choices */
          <div className="bg-[#1a1a2e] rounded-2xl border border-[#2d2d44] p-6">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-4">
              What do you do?
            </p>
            <div className="flex flex-col gap-3">
              {state.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(`Choice ${i + 1}`)}
                  disabled={choosing}
                  className="flex items-start gap-3 bg-[#111827] hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed border border-[#374151] hover:border-violet-500/50 rounded-xl px-4 py-3.5 text-left text-sm text-gray-300 hover:text-white transition-all"
                >
                  <span className="text-violet-500 font-semibold mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  <span>{choosing ? "Generating next scene..." : choice}</span>
                </button>
              ))}
            </div>

            {choosing && (
              <div className="flex items-center justify-center gap-2 mt-5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            )}
          </div>
        )}

      </div>
      <div ref={bottomRef} />
    </div>
  );
}