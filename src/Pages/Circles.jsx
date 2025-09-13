import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Star, Search, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

/** Mock circles — replace with Firestore later */
const MOCK_CIRCLES = [
  {
    id: "cl1",
    name: "DSA Daily",
    focus: "Algorithms & Problem Solving",
    level: "Intermediate",
    members: 42,
    openings: 3,
    private: false,
    rating: 4.7,
  },
  {
    id: "cl2",
    name: "SQL & Data Design",
    focus: "Databases, SQL, Normalization",
    level: "Beginner",
    members: 29,
    openings: 5,
    private: false,
    rating: 4.3,
  },
  {
    id: "cl3",
    name: "System Design Sundays",
    focus: "High-level Design, Tradeoffs",
    level: "Advanced",
    members: 18,
    openings: 0,
    private: true,
    rating: 4.8,
  },
];

const Circles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");

  const filtered = useMemo(() => {
    return MOCK_CIRCLES.filter((c) => {
      const byQ =
        !q ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.focus.toLowerCase().includes(q.toLowerCase());
      const byLevel = level === "All" || c.level === level;
      return byQ && byLevel;
    });
  }, [q, level]);

  const handleJoin = (circle) => {
    if (!user) {
      // ask user to login first, then come back here
      navigate("/login", { state: { from: location } });
      return;
    }
    // TODO: Firestore request to join/subscribe (out of scope for now)
    alert(`Request to join “${circle.name}” sent!`);
  };

  const subtle = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find a Circle</h1>
            <p className="text-gray-600 mt-1">
              Join a small group to learn by teaching and reviewing each other’s work.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => {
                if (!user) return navigate("/login", { state: { from: location } });
                // later: take to create-circle flow
                alert("Create circle flow coming soon.");
              }}
            >
              <Plus className="h-4 w-4" /> Create a circle
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="grid md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search circles, topics, keywords"
                className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              />
            </div>
            <div>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              >
                <option>All</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 grid items-center">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c, idx) => (
            <motion.div
              key={c.id}
              {...subtle}
              transition={{ duration: 0.25, delay: 0.03 * idx }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-sm text-gray-600">{c.focus}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" /> {c.rating}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {c.level}
                </span>
                <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  {c.members} members
                </span>
                {c.private ? (
                  <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 inline-flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> Private
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    Open
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Openings: <span className="font-medium text-gray-900">{c.openings}</span>
                </div>
                <button
                  onClick={() => handleJoin(c)}
                  className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={c.openings === 0}
                >
                  {c.private ? "Request to join" : "Join"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            No circles match your filters yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Circles;
