import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, ChevronUp, ChevronDown, Star } from "lucide-react";

/** Mock leaderboard — replace with Firestore later */
const MOCK = [
  { id: "u1", name: "You", xp: 1240, streak: 7 },
  { id: "u2", name: "Aanya", xp: 1180, streak: 6 },
  { id: "u3", name: "Kabir", xp: 980, streak: 5 },
  { id: "u4", name: "Meera", xp: 760, streak: 4 },
  { id: "u5", name: "Ishaan", xp: 640, streak: 3 },
  { id: "u6", name: "Riya", xp: 540, streak: 2 },
  { id: "u7", name: "Dev", xp: 520, streak: 2 },
];

const subtle = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const rankBadge = (rank) => {
  if (rank === 1) return "bg-yellow-100 text-yellow-800";
  if (rank === 2) return "bg-gray-100 text-gray-700";
  if (rank === 3) return "bg-amber-100 text-amber-800";
  return "bg-indigo-50 text-indigo-700";
};

const Leaderboard = () => {
  const [period, setPeriod] = useState("This week"); // UI only
  const [sortKey, setSortKey] = useState("xp"); // xp | streak
  const [sortDir, setSortDir] = useState("desc"); // asc | desc
  const [q, setQ] = useState("");

  const sorted = useMemo(() => {
    const copy = MOCK.filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        String(u.xp).includes(q)
    );
    copy.sort((a, b) => {
      const vA = a[sortKey];
      const vB = b[sortKey];
      return sortDir === "asc" ? vA - vB : vB - vA;
    });
    return copy;
  }, [sortKey, sortDir, q]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Circle leaderboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track XP and streaks to see who’s leading your learning circle.
              </p>
            </div>
          </div>

          {/* Period chips (UI only for now) */}
          <div className="flex gap-2">
            {["This week", "This month", "All time"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={[
                  "px-3 py-1.5 rounded-lg text-sm border",
                  period === p
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by</span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSort("xp")}
                  className={[
                    "px-3 py-1.5 rounded-lg text-sm border inline-flex items-center gap-1",
                    sortKey === "xp"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  XP
                  {sortKey === "xp" ? (
                    sortDir === "desc" ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )
                  ) : null}
                </button>
                <button
                  onClick={() => toggleSort("streak")}
                  className={[
                    "px-3 py-1.5 rounded-lg text-sm border inline-flex items-center gap-1",
                    sortKey === "streak"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  Streak
                  {sortKey === "streak" ? (
                    sortDir === "desc" ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )
                  ) : null}
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or XP"
                className="w-full md:w-72 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              />
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-semibold">Leaderboard</span>
              <span className="text-xs text-gray-500">({period})</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {sorted.map((row, idx) => {
              const rank = idx + 1;
              const isYou = row.name.toLowerCase() === "you";
              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.02 * idx }}
                  className={[
                    "px-5 py-3 flex items-center justify-between",
                    isYou ? "bg-indigo-50/40" : "bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "h-8 w-8 rounded-full grid place-items-center text-xs font-bold",
                        rankBadge(rank),
                      ].join(" ")}
                    >
                      {rank}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {row.name} {isYou && <span className="text-xs text-indigo-600">(you)</span>}
                      </div>
                      <div className="text-xs text-gray-500">Streak: {row.streak} days</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium text-gray-900">{row.xp} XP</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
