import React, { useMemo } from "react";
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
} from "lucide-react";

/* ----------------------------- Mock Data ----------------------------- */
const MOCK_ACTIVE_CHALLENGES = [
  {
    id: "c1",
    title: "Explain Recursion via a story",
    topic: "Algorithms",
    level: "Beginner",
    due: Date.now() + 1000 * 60 * 60 * 24 * 2,
    status: "in_progress",
  },
  {
    id: "c2",
    title: "SQL Joins with real-world examples",
    topic: "Databases",
    level: "Intermediate",
    due: Date.now() + 1000 * 60 * 60 * 24 * 5,
    status: "accepted",
  },
];

const MOCK_TEACHBACKS_DUE = [
  {
    id: "t1",
    prompt: "Teach back: Binary Search in plain English",
    requester: "Aanya",
    due: Date.now() + 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: "t2",
    prompt: "Teach back: Normalize vs Denormalize",
    requester: "Kabir",
    due: Date.now() + 1000 * 60 * 60 * 24 * 3,
  },
];

const MOCK_FEEDBACK_QUEUE = [
  { id: "f1", learner: "Ishaan", title: "My take on Cloud vs Edge", points: 10 },
  { id: "f2", learner: "Meera", title: "Sorting Visualized", points: 15 },
];

const MOCK_BADGES = [
  { id: "b1", name: "First Teach-Back", color: "bg-indigo-100 text-indigo-700" },
  { id: "b2", name: "Helper x5", color: "bg-emerald-100 text-emerald-700" },
  { id: "b3", name: "Challenge Streak", color: "bg-amber-100 text-amber-700" },
];

const MOCK_LEADERBOARD = [
  { id: "u1", name: "You", xp: 1240 },
  { id: "u2", name: "Aanya", xp: 1180 },
  { id: "u3", name: "Kabir", xp: 980 },
  { id: "u4", name: "Meera", xp: 760 },
  { id: "u5", name: "Ishaan", xp: 640 },
];

const MOCK_ACTIVITY = [
  { id: "a1", type: "challenge", text: "Accepted ‘Recursion via a story’", time: "2h ago" },
  { id: "a2", type: "teachback", text: "Completed a teach-back for Aanya", time: "1d ago" },
  { id: "a3", type: "feedback", text: "Gave feedback to Meera (+15)", time: "2d ago" },
];

/* ---------------------------- Small Utils ---------------------------- */
const daysLeft = (ts) => {
  const diff = ts - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const firstNameFrom = (user) => {
  if (user?.displayName) return user.displayName.split(" ")[0];
  if (user?.email) return user.email.split("@")[0];
  return "Friend";
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

/* --------------------------- Card Containers ------------------------- */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
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

/* ------------------------------- Main -------------------------------- */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Derived stats (mocked)
  const stats = useMemo(() => {
    const active = MOCK_ACTIVE_CHALLENGES.length;
    const teachbacks = MOCK_TEACHBACKS_DUE.length;
    const xp = 1240;
    const streak = 7;
    const level = Math.floor(xp / 500) + 1;
    const levelPct = Math.round(((xp % 500) / 500) * 100);
    return { active, teachbacks, xp, streak, level, levelPct };
  }, []);

  const name = firstNameFrom(user);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Greeting */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
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
              <button
                onClick={() => navigate("/challenges/create")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" /> Create challenge
              </button>
              <button
                onClick={() => navigate("/challenges")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
              >
                <Target className="h-4 w-4 text-gray-700" /> Browse challenges
              </button>
              <button
                onClick={() => navigate("/circles")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
              >
                <Users className="h-4 w-4 text-gray-700" /> Join a circle
              </button>
            </div>
          </div>
        </motion.section>

        {/* KPI tiles */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Active challenges</div>
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Target className="h-6 w-6" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Teach-backs due</div>
                <div className="text-2xl font-bold text-gray-900">{stats.teachbacks}</div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">XP</div>
                <div className="text-2xl font-bold text-gray-900">{stats.xp}</div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Star className="h-6 w-6" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Streak</div>
                <div className="text-2xl font-bold text-gray-900">{stats.streak} days</div>
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
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
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
                  {MOCK_ACTIVE_CHALLENGES.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-sm transition flex items-start justify-between gap-4"
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
                        {c.status === "accepted" ? (
                          <button className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">
                            Start
                          </button>
                        ) : (
                          <button className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                            Continue
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {MOCK_ACTIVE_CHALLENGES.length === 0 && (
                    <div className="text-sm text-gray-500">No active challenges yet.</div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Teach-backs Due */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
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
                  {MOCK_TEACHBACKS_DUE.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-sm transition flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{t.prompt}</div>
                        <div className="text-xs text-gray-600 mt-1">Requested by {t.requester}</div>
                        <div className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                          <Clock className="h-3.5 w-3.5" /> Due in {daysLeft(t.due)}d
                        </div>
                      </div>
                      <button className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                        Start teach-back
                      </button>
                    </div>
                  ))}

                  {MOCK_TEACHBACKS_DUE.length === 0 && (
                    <div className="text-sm text-gray-500">Nothing due right now. Nice!</div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Feedback to Give */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
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
                  {MOCK_FEEDBACK_QUEUE.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-sm transition flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{f.title}</div>
                        <div className="text-xs text-gray-600 mt-1">For {f.learner}</div>
                      </div>
                      <button className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">
                        Give feedback (+{f.points})
                      </button>
                    </div>
                  ))}
                  {MOCK_FEEDBACK_QUEUE.length === 0 && (
                    <div className="text-sm text-gray-500">No feedback requests pending.</div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Skill Portfolio */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardHeader
                  title="Skill portfolio"
                  icon={<Award className="h-5 w-5" />}
                  action={
                    <Link
                      to="/portfolio"
                      className="text-sm inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      View portfolio <ChevronRight className="h-4 w-4" />
                    </Link>
                  }
                />
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">Level</div>
                      <div className="text-2xl font-bold text-gray-900">Lv. {Math.floor(stats.xp / 500) + 1}</div>
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Progress to next level</div>
                        <ProgressRing value={stats.levelPct} label={`${stats.xp % 500} / 500 XP`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-2">Badges</div>
                      <div className="flex flex-wrap gap-2">
                        {MOCK_BADGES.map((b) => (
                          <span
                            key={b.id}
                            className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${b.color}`}
                          >
                            {b.name}
                          </span>
                        ))}
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
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
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
                  {MOCK_LEADERBOARD.map((row, i) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
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
                    </div>
                  ))}
                </CardBody>
              </Card>
            </motion.div>

            {/* Recent activity */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
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
                  <ol className="space-y-3">
                    {MOCK_ACTIVITY.map((a) => (
                      <li key={a.id} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                        <div>
                          <div className="text-sm text-gray-900">{a.text}</div>
                          <div className="text-xs text-gray-500">{a.time}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
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
