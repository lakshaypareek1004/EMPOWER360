import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/** Mock data — replace with Firestore later */
const MOCK_TO_GIVE = [
  { id: "f1", learner: "Ishaan", title: "My take on Cloud vs Edge", points: 10, age: "2h" },
  { id: "f2", learner: "Meera", title: "Sorting Visualized", points: 15, age: "1d" },
  { id: "f3", learner: "Aanya", title: "Intro to Graphs", points: 8, age: "3d" },
];

const MOCK_RECEIVED = [
  { id: "r1", from: "Kabir", title: "Your Teach-back: Binary Search", rating: 5, when: "yesterday" },
  { id: "r2", from: "Riya", title: "Challenge: Data Modeling 101", rating: 4, when: "2d ago" },
];

const MOCK_REQUESTS = [
  { id: "rq1", requester: "Dev", title: "Review my SQL joins explainer", when: "4h ago" },
];

const subtle = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const Feedback = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("toGive"); // toGive | received | requests
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const list =
      tab === "toGive" ? MOCK_TO_GIVE : tab === "received" ? MOCK_RECEIVED : MOCK_REQUESTS;

    if (!q.trim()) return list;

    const needle = q.toLowerCase();
    return list.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(needle))
    );
  }, [tab, q]);

  const counts = {
    toGive: MOCK_TO_GIVE.length,
    received: MOCK_RECEIVED.length,
    requests: MOCK_REQUESTS.length,
  };

  const isAuthed = !!user;

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
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback</h1>
              <p className="text-gray-600 mt-1">
                Strengthen the community by reviewing teach-backs and challenges.
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="px-3 py-2 rounded-lg bg-white border border-gray-100 text-center">
              <div className="text-xs text-gray-500">To give</div>
              <div className="text-sm font-semibold text-gray-900">{counts.toGive}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white border border-gray-100 text-center">
              <div className="text-xs text-gray-500">Received</div>
              <div className="text-sm font-semibold text-gray-900">{counts.received}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white border border-gray-100 text-center">
              <div className="text-xs text-gray-500">Requests</div>
              <div className="text-sm font-semibold text-gray-900">{counts.requests}</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs + Search */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-gray-100">
              {[
                { key: "toGive", label: "To give" },
                { key: "received", label: "Received" },
                { key: "requests", label: "Requests" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-sm",
                    tab === t.key
                      ? "bg-white border border-gray-200 text-gray-900"
                      : "text-gray-700",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, name, points…"
                className="w-full md:w-80 pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              />
            </div>
          </div>
        </motion.div>

        {/* Lists */}
        <motion.div
          {...subtle}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="divide-y divide-gray-100">
            {tab === "toGive" &&
              filtered.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.02 * i }}
                  className="px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-gray-900">{f.title}</div>
                    <div className="text-xs text-gray-600 mt-1">For {f.learner}</div>
                    <div className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                      <Clock className="h-3.5 w-3.5" /> Requested {f.age} ago
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">+{f.points} XP</div>
                    {isAuthed ? (
                      <Link
                        to={`/feedback/${f.id}`}
                        className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1"
                      >
                        Give feedback <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                        title="Log in to give feedback"
                      >
                        Log in to continue
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}

            {tab === "received" &&
              filtered.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.02 * i }}
                  className="px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-gray-900">{r.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      From {r.from} · {r.when}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-xs">
                      <ThumbsUp className="h-3.5 w-3.5" /> Rated {r.rating}/5
                    </div>
                  </div>
                  <div className="text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </motion.div>
              ))}

            {tab === "requests" &&
              filtered.map((rq, i) => (
                <motion.div
                  key={rq.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.02 * i }}
                  className="px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-gray-900">{rq.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Requested by {rq.requester} · {rq.when}
                    </div>
                  </div>
                  {isAuthed ? (
                    <Link
                      to={`/feedback/${rq.id}`}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      Review <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      Log in
                    </Link>
                  )}
                </motion.div>
              ))}

            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                Nothing here yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
