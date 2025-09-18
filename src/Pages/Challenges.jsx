// src/Pages/Challenges.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Search,
  Clock,
  ChevronRight,
  ArrowLeft,
  Plus,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

/* ---------------------------- Small Utils ---------------------------- */
const tsToMs = (ts) => {
  if (!ts) return 0;
  return ts.toMillis ? ts.toMillis() : (ts.seconds || 0) * 1000;
};

const daysLeft = (tsMs) => {
  const diff = tsMs - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const niceError = (err, fallback = "Something went wrong. Please try again.") => {
  const code = err?.code || "";
  const map = {
    "permission-denied": "You don’t have permission to access this data.",
    "not-found": "Data not found.",
    "unavailable": "Service is temporarily unavailable. Please retry.",
    "deadline-exceeded": "Request timed out. Please retry.",
    "resource-exhausted": "Quota exceeded. Please try again later.",
    "invalid-argument": "Invalid request. Please reload and try again.",
    "failed-precondition":
      "This query needs an index. Reload and click the 'Create index' link if prompted.",
  };
  return map[code] || fallback;
};

/* --------------------------- Motion presets -------------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};
const listContainer = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { when: "beforeChildren", staggerChildren: 0.06 },
  },
};
const listItem = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
};

/* --------------------------- Card Containers ------------------------- */
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ title, icon, action }) => (
  <div className="flex items-center justify-between p-5 border-b border-gray-100">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {action ? <div className="text-sm">{action}</div> : null}
  </div>
);
const CardBody = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

/* ------------------------------ Page ------------------------------- */
const Challenges = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid;

  const [q, setQ] = useState("");
  const [mine, setMine] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [errMine, setErrMine] = useState(null);

  // Subscribe: my challenges
  useEffect(() => {
    if (!uid) return;
    setLoadingMine(true);
    setErrMine(null);

    const q1 = query(
      collection(db, "challenges"),
      where("ownerId", "==", uid),
      orderBy("dueTs", "asc")
    );
    const unsub = onSnapshot(
      q1,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMine(rows);
        setLoadingMine(false);
      },
      (e) => {
        setErrMine(niceError(e, "Couldn’t load your challenges."));
        setLoadingMine(false);
      }
    );
    return () => unsub();
  }, [uid]);

  // Search filter (only on my list)
  const filtered = useMemo(() => {
    if (!q.trim()) return mine;
    const needle = q.toLowerCase();
    return mine.filter((x) =>
      [
        x.title,
        x.topic,
        x.level,
        x.status,
        x.author,
        (x.tags || []).join(","),
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle))
    );
  }, [mine, q]);

  /* -------------------- Button behaviours / handlers -------------------- */
  const handleOpenChallenge = async (c) => {
    try {
      // For your own challenges, move to in_progress then open work UI
      if (c.ownerId === uid) {
        if (c.status === "accepted") {
          await updateDoc(doc(db, "challenges", c.id), {
            status: "in_progress",
            updatedAt: serverTimestamp(),
          });
          navigate(`/challenges/${c.id}/work`);
          return;
        }
        if (c.status === "in_progress" || c.status === "open") {
          navigate(`/challenges/${c.id}/work`);
          return;
        }
      }
      // Fallback: view read page
      navigate(`/challenges/${c.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const goBack = () => navigate("/dashboard");

  /* ------------------------------ Render ------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <motion.button
              onClick={goBack}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Back to dashboard"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>

            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Challenges
              </h1>
              <p className="text-gray-600 mt-1">
                Create and work on your challenges. Teach, track, and complete.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => navigate("/circles")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-800"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="h-4 w-4 text-gray-700" />
              Join a circle
            </motion.button>
            <motion.button
              onClick={() => navigate("/challenges/create")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-800"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4" /> Create challenge
            </motion.button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-gray-700 font-medium">
              Your challenges
            </div>

            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, topic, level…"
                className="w-full md:w-96 pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              />
            </div>
          </div>
        </motion.div>

        {/* List of my challenges */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.08 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
            <CardHeader
              title="Your challenges"
              icon={<Target className="h-5 w-5" />}
              action={
                <Link
                  to="/challenges/create"
                  className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                >
                  New <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
            <CardBody>
              {errMine && (
                <div className="mb-3 text-sm text-red-600">{errMine}</div>
              )}

              {loadingMine ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-gray-500">
                  You have no challenges. Create one to get started.
                </div>
              ) : (
                <motion.div
                  variants={listContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {filtered.map((c) => (
                    <motion.div
                      key={c.id}
                      variants={listItem}
                      className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-md hover:-translate-y-0.5 transition flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {c.title}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {c.topic && (
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {c.topic}
                            </span>
                          )}
                          {c.level && (
                            <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                              {c.level}
                            </span>
                          )}
                          {c.dueTs ? (
                            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Due in {daysLeft(tsToMs(c.dueTs))}d
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => handleOpenChallenge(c)}
                          className={[
                            "px-3 py-2 text-sm rounded-lg transition",
                            c.status === "accepted"
                              ? "border border-gray-200 hover:bg-gray-100"
                              : "bg-indigo-600 text-white hover:bg-indigo-800",
                          ].join(" ")}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          title={c.status === "accepted" ? "Start" : "Continue"}
                        >
                          {c.status === "accepted" ? "Start" : "Continue"}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardBody>
          </Card>

          {/* Right-side helper / tips */}
          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
            <CardHeader
              title="Tips to craft great challenges"
              icon={<Target className="h-5 w-5" />}
            />
            <CardBody className="space-y-3 text-sm text-gray-700">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-900">
                <div className="font-medium">Be clear & concrete</div>
                <div className="mt-1 text-indigo-900/90">
                  Define the expected outcome, constraints, and time limit.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-900">
                <div className="font-medium">Focus on teach-backs</div>
                <div className="mt-1 text-indigo-900/90">
                  Ask the assignee to explain the concept in their own words.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-900">
                <div className="font-medium">Reward progress</div>
                <div className="mt-1 text-indigo-900/90">
                  Offer XP points, badges, or peer recognition for completion.
                </div>
              </div>
              <div className="mt-3">
                <Link
                  to="/challenges/create"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  Create a new challenge <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardBody>
          </Card>
        </motion.section>
      </main>
    </div>
  );
};

export default Challenges;
