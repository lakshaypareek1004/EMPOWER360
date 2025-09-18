// src/Pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Target,
  BookOpen,
  MessageSquare,
  Award,
  Flame,
  Star,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
  AlertCircle,
} from "lucide-react";

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  addDoc,
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

const firstNameFrom = (user) => {
  if (user?.displayName) return user.displayName.split(" ")[0];
  if (user?.email) return user.email.split("@")[0];
  return "Friend";
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

// Simple conic progress ring
const ProgressRing = ({ value = 0, size = 88, stroke = 10, label = "" }) => {
  const pct = Math.max(0, Math.min(100, value));
  const bg = `conic-gradient(#4f46e5 ${pct * 3.6}deg, #e5e7eb ${pct * 3.6}deg)`;
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-full grid place-items-center"
        style={{ width: size, height: size, background: bg }}
        aria-label={`progress ${pct}%`}
      >
        <div
          className="bg-white rounded-full grid place-items-center"
          style={{ width: size - stroke * 2, height: size - stroke * 2 }}
        >
          <span className="text-sm font-semibold text-gray-900">{pct}%</span>
        </div>
      </div>
      {label ? <div className="mt-2 text-xs text-gray-500">{label}</div> : null}
    </div>
  );
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

/* -------------------------- Error Banner UI -------------------------- */
const AlertBanner = ({ messages = [] }) => {
  if (!messages.length) return null;
  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <div className="font-medium">We couldn’t load some data</div>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------- Main ------------------------------- */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid;

  // Profile
  const [profile, setProfile] = useState({ xp: 0, streak: 0, badges: [] });

  // Lists
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [teachbacksDue, setTeachbacksDue] = useState([]);
  const [feedbackQueue, setFeedbackQueue] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activity, setActivity] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    profile: null,
    challenges: null,
    teachbacks: null,
    feedback: null,
    activity: null,
    leaderboard: null,
  });

  const setErr = (key, val) =>
    setErrors((e) => ({
      ...e,
      [key]: val,
    }));

  // tiny helper to log activity
  const postActivity = async (text, type = "info") => {
    try {
      await addDoc(collection(db, "activity"), {
        userId: uid,
        text,
        type,
        createdAt: serverTimestamp(),
      });
    } catch {
      /* no-op */
    }
  };

  /* -------------------------- Firestore bindings -------------------------- */
  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    setErrors({
      profile: null,
      challenges: null,
      teachbacks: null,
      feedback: null,
      activity: null,
      leaderboard: null,
    });
    const unsubs = [];

    // 1) Profile doc
    (async () => {
      try {
        const snap = await getDoc(doc(db, "profiles", uid));
        if (snap.exists()) {
          const p = snap.data();
          setProfile({
            xp: Number(p?.xp || 0),
            streak: Number(p?.streak || 0),
            badges: Array.isArray(p?.badges) ? p.badges : [],
            displayName: p?.displayName,
            photoURL: p?.photoURL,
          });
        } else {
          setProfile({ xp: 0, streak: 0, badges: [] });
        }
        setErr("profile", null);
      } catch (err) {
        setErr("profile", niceError(err, "Couldn’t load your profile."));
      }
    })();

    // 2) Active challenges for this user
    {
      const q1 = query(
        collection(db, "challenges"),
        where("ownerId", "==", uid),
        orderBy("dueTs", "asc"),
        limit(5)
      );
      unsubs.push(
        onSnapshot(
          q1,
          (snap) => {
            const rows = snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                title: x.title,
                topic: x.topic,
                level: x.level,
                status: x.status,
                due: tsToMs(x.dueTs),
              };
            });
            setActiveChallenges(rows);
            setErr("challenges", null);
          },
          (err) => setErr("challenges", niceError(err, "Couldn’t load your challenges."))
        )
      );
    }

    // 3) Teach-backs due for this user
    {
      const q2 = query(
        collection(db, "teachbacks"),
        where("assigneeId", "==", uid),
        orderBy("dueTs", "asc"),
        limit(5)
      );
      unsubs.push(
        onSnapshot(
          q2,
          (snap) => {
            const rows = snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                prompt: x.prompt,
                requester: x.requester,
                due: tsToMs(x.dueTs),
              };
            });
            setTeachbacksDue(rows);
            setErr("teachbacks", null);
          },
          (err) => setErr("teachbacks", niceError(err, "Couldn’t load teach-backs."))
        )
      );
    }

    // 4) Feedback queue assigned to this user
    {
      const q3 = query(
        collection(db, "feedbackQueue"),
        where("reviewerId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      unsubs.push(
        onSnapshot(
          q3,
          (snap) => {
            const rows = snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                learner: x.learner,
                title: x.title,
                points: Number(x.points || 0),
              };
            });
            setFeedbackQueue(rows);
            setErr("feedback", null);
          },
          (err) => setErr("feedback", niceError(err, "Couldn’t load feedback queue."))
        )
      );
    }

    // 5) Activity feed for this user
    {
      const q4 = query(
        collection(db, "activity"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      unsubs.push(
        onSnapshot(
          q4,
          (snap) => {
            const rows = snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                type: x.type,
                text: x.text,
                time: new Date(tsToMs(x.createdAt)).toLocaleString(),
              };
            });
            setActivity(rows);
            setErr("activity", null);
          },
          (err) => setErr("activity", niceError(err, "Couldn’t load recent activity."))
        )
      );
    }

    // 6) Leaderboard (global top XP)
    {
      const q5 = query(collection(db, "profiles"), orderBy("xp", "desc"), limit(5));
      unsubs.push(
        onSnapshot(
          q5,
          (snap) => {
            const rows = snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                name: x.displayName || d.id.slice(0, 6),
                xp: Number(x.xp || 0),
              };
            });
            setLeaderboard(rows);
            setErr("leaderboard", null);
          },
          (err) => setErr("leaderboard", niceError(err, "Couldn’t load leaderboard."))
        )
      );
    }

    const t = setTimeout(() => setLoading(false), 300);
    return () => {
      unsubs.forEach((u) => u && u());
      clearTimeout(t);
    };
  }, [uid]);

  /* -------------------- Button behaviours / handlers -------------------- */
  const handleChallengeAction = async (c) => {
    try {
      // accepted → in_progress then open work UI
      if (c.status === "accepted") {
        await updateDoc(doc(db, "challenges", c.id), {
          status: "in_progress",
          updatedAt: serverTimestamp(),
        });
        await postActivity(`Started "${c.title}"`, "challenge");
        navigate(`/challenges/${c.id}/work`);
        return;
      }
      // in_progress → open work UI
      if (c.status === "in_progress") {
        navigate(`/challenges/${c.id}/work`);
        return;
      }
      // default fallback
      navigate(`/challenges/${c.id}`);
    } catch (err) {
      setErr("challenges", niceError(err, "Couldn’t update the challenge."));
    }
  };

  const handleTeachbackStart = async (t) => {
    try {
      await updateDoc(doc(db, "teachbacks", t.id), {
        status: "in_progress",
        updatedAt: serverTimestamp(),
      });
      await postActivity(`Started teach-back "${t.prompt}"`, "teachback");
      navigate(`/teachbacks/${t.id}/work`);
    } catch (err) {
      setErr("teachbacks", niceError(err, "Couldn’t start the teach-back."));
    }
  };

  /* ----------------------------- Derived stats ---------------------------- */
  const stats = useMemo(() => {
    const active = activeChallenges.length;
    const teachbacks = teachbacksDue.length;
    const xp = Number(profile?.xp || 0);
    const streak = Number(profile?.streak || 0);
    const level = Math.floor(xp / 500) + 1;
    const levelPct = Math.round(((xp % 500) / 500) * 100);
    return { active, teachbacks, xp, streak, level, levelPct };
  }, [activeChallenges.length, teachbacksDue.length, profile?.xp, profile?.streak]);

  const name = firstNameFrom(user);

  // Top banner combines any non-null error messages
  const bannerErrors = Object.values(errors).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error banner (global) */}
        <AlertBanner messages={bannerErrors} />

        {/* Greeting */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Hey {name}, let’s keep your momentum going
              </h1>
              <p className="text-gray-600 mt-1">
                Learn by teaching. Build your verified skill portfolio.
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={() => navigate("/challenges/create")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" /> Create challenge
              </motion.button>
              <motion.button
                onClick={() => navigate("/challenges")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Target className="h-4 w-4 text-gray-700" /> Browse challenges
              </motion.button>
              <motion.button
                onClick={() => navigate("/circles")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users className="h-4 w-4 text-gray-700" /> Join a circle
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* KPI tiles */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.04 }}
          className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
        >
          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Active challenges</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? "…" : stats.active}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Target className="h-6 w-6" />
              </div>
            </CardBody>
          </Card>

          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Teach-backs due</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? "…" : stats.teachbacks}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
            </CardBody>
          </Card>

          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">XP</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? "…" : stats.xp}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Star className="h-6 w-6" />
              </div>
            </CardBody>
          </Card>

          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Streak</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? "…" : `${stats.streak} days`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Flame className="h-6 w-6" />
              </div>
            </CardBody>
          </Card>
        </motion.section>

        {/* Main grid */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Challenges */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
                <CardHeader
                  title="Your active challenges"
                  icon={<Target className="h-5 w-5" />}
                  action={
                    <Link
                      to="/challenges"
                      className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <CardBody className="space-y-3">
                  {errors.challenges && (
                    <div className="text-sm text-red-600">{errors.challenges}</div>
                  )}

                  <motion.div variants={listContainer} initial="hidden" animate="visible" className="space-y-3">
                    {activeChallenges.map((c) => (
                      <motion.div
                        key={c.id}
                        variants={listItem}
                        className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-md hover:-translate-y-0.5 transition flex items-start justify-between gap-4"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{c.title}</div>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{c.topic}</span>
                            <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">{c.level}</span>
                            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Due in {daysLeft(c.due)}d
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => handleChallengeAction(c)}
                            className={[
                              "px-3 py-2 text-sm rounded-lg",
                              c.status === "accepted"
                                ? "border border-gray-200 hover:bg-gray-50"
                                : "bg-indigo-600 text-white hover:bg-indigo-700",
                            ].join(" ")}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {c.status === "accepted" ? "Start" : "Continue"}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {!errors.challenges && !loading && activeChallenges.length === 0 && (
                    <div className="text-sm text-gray-500">No active challenges yet.</div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Teach-backs Due */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
                <CardHeader
                  title="Teach-backs due"
                  icon={<BookOpen className="h-5 w-5" />}
                  action={
                    <Link
                      to="/teachbacks"
                      className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      See all <ChevronRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <CardBody className="space-y-3">
                  {errors.teachbacks && (
                    <div className="text-sm text-red-600">{errors.teachbacks}</div>
                  )}

                  <motion.div variants={listContainer} initial="hidden" animate="visible" className="space-y-3">
                    {teachbacksDue.map((t) => (
                      <motion.div
                        key={t.id}
                        variants={listItem}
                        className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-md hover:-translate-y-0.5 transition flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{t.prompt}</div>
                          <div className="text-xs text-gray-600 mt-1">Requested by {t.requester}</div>
                          <div className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                            <Clock className="h-3.5 w-3.5" /> Due in {daysLeft(t.due)}d
                          </div>
                        </div>
                        <motion.button
                          onClick={() => handleTeachbackStart(t)}
                          className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Start teach-back
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>

                  {!errors.teachbacks && !loading && teachbacksDue.length === 0 && (
                    <div className="text-sm text-gray-500">Nothing due right now. Nice!</div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Feedback to Give */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
                <CardHeader
                  title="Feedback to give"
                  icon={<MessageSquare className="h-5 w-5" />}
                  action={
                    <Link
                      to="/feedback"
                      className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      Open queue <ChevronRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <CardBody className="space-y-3">
                  {errors.feedback && (
                    <div className="text-sm text-red-600">{errors.feedback}</div>
                  )}

                  <motion.div variants={listContainer} initial="hidden" animate="visible" className="space-y-3">
                    {feedbackQueue.map((f) => (
                      <motion.div
                        key={f.id}
                        variants={listItem}
                        className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-md hover:-translate-y-0.5 transition flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{f.title}</div>
                          <div className="text-xs text-gray-600 mt-1">For {f.learner}</div>
                        </div>
                        <motion.button
                          onClick={() => navigate("/feedback")}
                          className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Give feedback (+{f.points})
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>

                  {!errors.feedback && !loading && feedbackQueue.length === 0 && (
                    <div className="text-sm text-gray-500">No feedback requests pending.</div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Skill Portfolio */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
                <CardHeader
                  title="Skill portfolio"
                  icon={<Award className="h-5 w-5" />}
                  action={
                    <button
                      onClick={() => navigate("/portfolio")}
                      className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      View portfolio <ChevronRight className="h-4 w-4" />
                    </button>
                  }
                />
                <CardBody>
                  {errors.profile && (
                    <div className="mb-3 text-sm text-red-600">{errors.profile}</div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">Level</div>
                      <div className="text-2xl font-bold text-gray-900">
                        Lv. {Math.floor((profile?.xp || 0) / 500) + 1}
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Progress to next level</div>
                        <ProgressRing
                          value={Math.round((((profile?.xp || 0) % 500) / 500) * 100)}
                          label={`${(profile?.xp || 0) % 500} / 500 XP`}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-2">Badges</div>
                      <div className="flex flex-wrap gap-2">
                        {(profile.badges || []).map((b, idx) => (
                          <span
                            key={`${b}-${idx}`}
                            className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                          >
                            {b}
                          </span>
                        ))}
                        {(!profile.badges || profile.badges.length === 0) && (
                          <span className="text-xs text-gray-500">No badges yet</span>
                        )}
                      </div>
                      <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Peer-validated skills added to resume/CV
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
                <CardHeader
                  title="This week’s circle leaderboard"
                  icon={<Users className="h-5 w-5" />}
                  action={
                    <Link
                      to="/leaderboard"
                      className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      Full board <ChevronRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <CardBody className="space-y-3">
                  {errors.leaderboard && (
                    <div className="text-sm text-red-600">{errors.leaderboard}</div>
                  )}

                  <motion.div variants={listContainer} initial="hidden" animate="visible" className="space-y-3">
                    {leaderboard.map((row, i) => (
                      <motion.div
                        key={row.id}
                        variants={listItem}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              "h-7 w-7 rounded-full grid place-items-center text-xs font-bold",
                              i === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : i === 1
                                ? "bg-gray-100 text-gray-700"
                                : i === 2
                                ? "bg-amber-100 text-amber-800"
                                : "bg-indigo-50 text-indigo-700",
                            ].join(" ")}
                          >
                            {i + 1}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{row.name}</div>
                        </div>
                        <div className="text-sm text-gray-600">{row.xp} XP</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Recent activity */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
                <CardHeader
                  title="Recent activity"
                  icon={<Clock className="h-5 w-5" />}
                  action={
                    <Link
                      to="/activity"
                      className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      See all <ChevronRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <CardBody>
                  {errors.activity && (
                    <div className="mb-2 text-sm text-red-600">{errors.activity}</div>
                  )}

                  <motion.ol variants={listContainer} initial="hidden" animate="visible" className="space-y-3">
                    {activity.map((a) => (
                      <motion.li key={a.id} variants={listItem} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                        <div>
                          <div className="text-sm text-gray-900">{a.text}</div>
                          <div className="text-xs text-gray-500">{a.time}</div>
                        </div>
                      </motion.li>
                    ))}
                    {!errors.activity && !loading && activity.length === 0 && (
                      <li className="text-sm text-gray-500">No recent activity</li>
                    )}
                  </motion.ol>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
