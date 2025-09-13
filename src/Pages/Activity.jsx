import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Target,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Filter,
} from "lucide-react";

/** Mock timeline data — replace with Firestore later */
const MOCK_ACTIVITY = [
  { id: "a1", type: "challenge", text: "Accepted ‘Recursion via a story’", time: "2h ago", meta: "Algorithms" },
  { id: "a2", type: "teachback", text: "Completed a teach-back for Aanya", time: "1d ago", meta: "Binary Search" },
  { id: "a3", type: "feedback", text: "Gave feedback to Meera (+15)", time: "2d ago", meta: "Sorting Visualized" },
  { id: "a4", type: "challenge", text: "Finished ‘SQL joins explained’", time: "3d ago", meta: "Databases" },
  { id: "a5", type: "teachback", text: "Teach-back scheduled with Kabir", time: "4d ago", meta: "Normalization" },
];

const typeChipStyles = {
  challenge: "bg-indigo-50 text-indigo-700",
  teachback: "bg-emerald-50 text-emerald-700",
  feedback: "bg-amber-50 text-amber-700",
};

const typeIcon = (t) => {
  if (t === "challenge") return <Target className="h-4 w-4" />;
  if (t === "teachback") return <BookOpen className="h-4 w-4" />;
  if (t === "feedback") return <MessageSquare className="h-4 w-4" />;
  return <Clock className="h-4 w-4" />;
};

const Activity = () => {
  const [filter, setFilter] = useState("All"); // All | challenge | teachback | feedback
  const [q, setQ] = useState("");

  const subtle = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  const filtered = useMemo(() => {
    return MOCK_ACTIVITY.filter((a) => {
      const byType = filter === "All" || a.type === filter;
      const byQ =
        !q ||
        a.text.toLowerCase().includes(q.toLowerCase()) ||
        a.meta.toLowerCase().includes(q.toLowerCase());
      return byType && byQ;
    });
  }, [filter, q]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Recent activity</h1>
            <p className="text-gray-600 mt-1">
              Your learning timeline across challenges, teach-backs, and feedback.
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" /> Filter
              </span>

              <div className="flex flex-wrap gap-2">
                {["All", "challenge", "teachback", "feedback"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={[
                      "px-3 py-1.5 rounded-lg text-sm border",
                      filter === f
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {f === "All" ? "All" : f[0].toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search your activity"
                className="w-full md:w-72 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              />
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
        >
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No activity yet.</div>
          ) : (
            <ol className="space-y-4">
              {filtered.map((a, idx) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.03 * idx }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={[
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          typeChipStyles[a.type] || "bg-gray-100 text-gray-700",
                        ].join(" ")}
                      >
                        {typeIcon(a.type)}
                        {a.type[0].toUpperCase() + a.type.slice(1)}
                      </span>

                      <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {a.time}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-gray-900">{a.text}</div>
                    <div className="text-xs text-gray-600">{a.meta}</div>
                  </div>
                </motion.li>
              ))}
            </ol>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Activity auto-updates as you complete challenges and teach-backs.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Activity;
