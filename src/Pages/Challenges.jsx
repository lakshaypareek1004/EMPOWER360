import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Filter,
  Search,
  Clock,
  Tag,
  Star,
  Users,
  ChevronRight,
  CheckCircle2,
  Plus,
} from "lucide-react";

/* ----------------------------- Mock Data ----------------------------- */
const MOCK_CHALLENGES = [
  {
    id: "c1",
    title: "Explain Recursion via a story",
    topic: "Algorithms",
    level: "Beginner",
    points: 25,
    author: "Aanya",
    due: Date.now() + 1000 * 60 * 60 * 24 * 2,
    status: "open",
    tags: ["storytelling", "fundamentals"],
    description:
      "Use a simple bedtime-story style example to explain how a function can call itself.",
  },
  {
    id: "c2",
    title: "SQL Joins with real-world examples",
    topic: "Databases",
    level: "Intermediate",
    points: 40,
    author: "Kabir",
    due: Date.now() + 1000 * 60 * 60 * 24 * 5,
    status: "accepted",
    tags: ["SQL", "joins", "visual"],
    description:
      "Teach left, right, inner, outer joins using restaurant orders and customers.",
  },
  {
    id: "c3",
    title: "Binary Search - draw and teach",
    topic: "Algorithms",
    level: "Beginner",
    points: 20,
    author: "Meera",
    due: Date.now() + 1000 * 60 * 60 * 24 * 1,
    status: "in_progress",
    tags: ["whiteboard", "search"],
    description:
      "Show how binary search halves the search space and why it is O(log n).",
  },
  {
    id: "c4",
    title: "Normalize vs Denormalize",
    topic: "Databases",
    level: "Advanced",
    points: 50,
    author: "Ishaan",
    due: Date.now() + 1000 * 60 * 60 * 24 * 7,
    status: "open",
    tags: ["design", "tradeoffs"],
    description:
      "Explain 3NF, duplication, and when denormalization is practical for reads.",
  },
  {
    id: "c5",
    title: "Cloud vs Edge - where to run?",
    topic: "Systems",
    level: "Intermediate",
    points: 35,
    author: "Nia",
    due: Date.now() + 1000 * 60 * 60 * 24 * 4,
    status: "completed",
    tags: ["architecture", "latency"],
    description:
      "Compare latency, bandwidth costs, privacy, and reliability with examples.",
  },
  {
    id: "c6",
    title: "Rate Limiting 101",
    topic: "Systems",
    level: "Advanced",
    points: 45,
    author: "Omar",
    due: Date.now() + 1000 * 60 * 60 * 24 * 3,
    status: "open",
    tags: ["APIs", "leaky bucket"],
    description:
      "Explain token bucket vs leaky bucket and when to apply each pattern.",
  },
];

/* ----------------------------- Utilities ----------------------------- */
const daysLeft = (ts) => Math.max(0, Math.ceil((ts - Date.now()) / (1000 * 60 * 60 * 24)));
const levelBadge = (lvl) =>
  lvl === "Beginner"
    ? "bg-emerald-50 text-emerald-700"
    : lvl === "Intermediate"
    ? "bg-indigo-50 text-indigo-700"
    : "bg-amber-50 text-amber-700";

/* ---------------------- Subtle animation presets --------------------- */
const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.18, ease: "easeIn" } },
};

/* --------------------------- Challenge Card -------------------------- */
const ChallengeCard = ({ ch, onAction }) => {
  const dueIn = daysLeft(ch.due);
  const statusChip =
    ch.status === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : ch.status === "in_progress"
      ? "bg-sky-50 text-sky-700"
      : ch.status === "accepted"
      ? "bg-indigo-50 text-indigo-700"
      : "bg-gray-100 text-gray-700";

  const actionLabel =
    ch.status === "open"
      ? "Accept"
      : ch.status === "accepted"
      ? "Start"
      : ch.status === "in_progress"
      ? "Mark complete"
      : "View";

  return (
    <motion.div
      layout
      variants={fadeUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-indigo-200/70 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs ${statusChip}`}>
              {ch.status.replace("_", " ")}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${levelBadge(ch.level)}`}>
              {ch.level}
            </span>
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {ch.topic}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 truncate">{ch.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ch.description}</p>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            {ch.tags?.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-1 rounded-full bg-gray-50 text-gray-600">
                #{t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Due in {dueIn}d
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4" />
              {ch.points} pts
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" />
              by {ch.author}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => onAction(ch)}
            className={[
              "px-3 py-2 text-sm rounded-lg transition",
              ch.status === "open" || ch.status === "in_progress"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : ch.status === "accepted"
                ? "border border-gray-200 hover:bg-gray-50"
                : "border border-gray-200"
            ].join(" ")}
          >
            {actionLabel}
          </button>
          <Link
            to={`/challenges/${ch.id}`}
            className="text-xs inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
          >
            Details <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------- Page -------------------------------- */
function Challenges() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [level, setLevel] = useState("All");
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("due_asc");
  const [items, setItems] = useState(MOCK_CHALLENGES);

  const topics = useMemo(
    () => ["All", ...Array.from(new Set(MOCK_CHALLENGES.map((c) => c.topic)))],
    []
  );

  const filtered = useMemo(() => {
    let list = [...items];
    if (tab !== "all") {
      const map = { open: "open", accepted: "accepted", progress: "in_progress", completed: "completed" };
      list = list.filter((c) => c.status === map[tab]);
    }
    if (topic !== "All") list = list.filter((c) => c.topic === topic);
    if (level !== "All") list = list.filter((c) => c.level === level);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sort === "due_asc") list.sort((a, b) => a.due - b.due);
    if (sort === "points_desc") list.sort((a, b) => b.points - a.points);
    return list;
  }, [items, tab, topic, level, query, sort]);

  const counts = useMemo(() => {
    const c = { all: items.length, open: 0, accepted: 0, progress: 0, completed: 0 };
    items.forEach((i) => {
      if (i.status === "open") c.open++;
      else if (i.status === "accepted") c.accepted++;
      else if (i.status === "in_progress") c.progress++;
      else if (i.status === "completed") c.completed++;
    });
    return c;
  }, [items]);

  const handleAction = (ch) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== ch.id) return i;
        if (i.status === "open") return { ...i, status: "accepted" };
        if (i.status === "accepted") return { ...i, status: "in_progress" };
        if (i.status === "in_progress") return { ...i, status: "completed" };
        return i;
      })
    );
  };

  const resetFilters = () => {
    setQuery("");
    setTopic("All");
    setLevel("All");
    setTab("all");
    setSort("due_asc");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 grid place-items-center text-white font-bold">E</div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Empower360</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Challenges</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/challenges/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Create challenge
            </Link>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          {[
            ["all", `All (${counts.all})`],
            ["open", `Open (${counts.open})`],
            ["accepted", `Accepted (${counts.accepted})`],
            ["progress", `In progress (${counts.progress})`],
            ["completed", `Completed (${counts.completed})`],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                "px-3 py-1.5 rounded-full text-sm border transition-colors",
                tab === key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="grid lg:grid-cols-4 gap-3">
            {/* search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, tags, description"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* topic */}
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  Topic: {t}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {["All", "Beginner", "Intermediate", "Advanced"].map((l) => (
                  <option key={l} value={l}>
                    Level: {l}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="due_asc">Sort: Due date - soonest</option>
                <option value="points_desc">Sort: Points - highest</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Use search and filters to find the best challenge to teach.</span>
            </div>
            <button onClick={resetFilters} className="text-indigo-600 hover:text-indigo-700">
              Reset
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="sync">
          {filtered.length > 0 ? (
            <motion.div layout className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <ChallengeCard key={c.id} ch={c} onAction={handleAction} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="bg-white border border-gray-100 rounded-2xl p-10 text-center"
            >
              <Target className="h-10 w-10 mx-auto text-gray-300" />
              <h3 className="mt-3 text-gray-900 font-semibold">No challenges match your filters</h3>
              <p className="text-gray-600 text-sm mt-1">Try clearing filters or browse all topics.</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Clear filters
                </button>
                <Link
                  to="/challenges/create"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Create challenge
                </Link>
              </div>
              <div className="mt-4 text-xs text-gray-500 inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Teach something you learned this week - it compounds fast.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Challenges;
