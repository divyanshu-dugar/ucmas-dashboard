"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const ROWS = ["A", "B", "C", "D", "E"];

export default function StudentListeningPage() {
  const { data: session, status } = useSession();

  const [weeks, setWeeks] = useState([]);
  const [row, setRow] = useState("A");
  const [score, setScore] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/listening")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWeeks(data);
        else setWeeks([]);
      });
  }, [status]);

  const currentWeek = weeks[0];
  const usedRows = currentWeek?.rows?.map(r => r.row) || [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (score === "") return;
    setLoading(true);
    const res = await fetch("/api/listening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row, score: Number(score), comments }),
    });
    if (res.ok) {
      const updatedWeek = await res.json();
      setWeeks(prev => [updatedWeek, ...prev.filter(w => w._id !== updatedWeek._id)]);
      setScore("");
      setComments("");
    }
    setLoading(false);
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Not authenticated
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Weekly Listening Scores
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track weekly listening performance by row.
          </p>
        </div>

        {/* ADD SCORE CARD */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Add Listening Score
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Row
              </label>
              <select
                value={row}
                onChange={e => setRow(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              >
                {ROWS.map(r => (
                  <option key={r} value={r} disabled={usedRows.includes(r)}>
                    Row {r} {usedRows.includes(r) ? "(Added)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Score
              </label>
              <input
                type="number"
                value={score}
                onChange={e => setScore(e.target.value)}
                min="0"
                max="10"
                required
                placeholder="0 – 10"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments (optional)
              </label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={3}
                placeholder="Add a short note…"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading || usedRows.length >= 5}
                className="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving…" : "Add Score"}
              </button>

              {usedRows.length >= 5 && (
                <span className="text-sm text-gray-500">
                  Week complete (5/5 rows)
                </span>
              )}
            </div>
          </form>
        </div>

        {/* WEEKS */}
        <div className="space-y-6">
          {weeks.map(week => (
            <div
              key={week._id}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Week of{" "}
                {week.weekStart
                  ? new Date(week.weekStart).toLocaleDateString()
                  : "—"}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="px-3 py-2 text-left font-medium">Row</th>
                      <th className="px-3 py-2 text-left font-medium">Score</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {week?.rows?.map(r => (
                      <tr
                        key={r.row}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {r.row}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {r.score}/10
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {r.comments || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
