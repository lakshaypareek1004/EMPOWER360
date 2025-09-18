// src/Pages/Portfolio.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  User,
  Award,
  Star,
  Flame,
  Clock,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Target,
} from "lucide-react";

/* ---------- Motion presets ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};
const listContainer = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { when: "beforeChildren", staggerChildren: 0.06 } },
};
const listItem = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
};

/* ---------- Small utils ---------- */
const tsToMs = (ts) => (ts?.toMillis ? ts.toMillis() : (ts?.seconds || 0) * 1000);
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

/* ---------- Simple ring ---------- */
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

/* ---------- Card ---------- */
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

const Portfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid;

  const [profile, setProfile] = useState({ xp: 0, streak: 0, badges: [] });
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [completedTeachbacks, setCompletedTeachbacks] = useState([]);

  const [errs, setErrs] = useState({ profile: null, ch: null, tb: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setErrs({ profile: null, ch: null, tb: null });
    const unsubs = [];

    // Profile
    (async () => {
      try {
        const snap = await getDoc(doc(db, "profiles", uid));
        if (snap.exists()) {
          const p = snap.data();
          setProfile({
            xp: Number(p?.xp || 0),
            streak: Number(p?.streak || 0),
            badges: Array.isArray(p?.badges) ? p.badges : [],
            displayName: p?.displayName || user?.displayName || user?.email?.split("@")[0],
            photoURL: p?.photoURL || user?.photoURL,
            email: user?.email,
          });
        } else {
          setProfile({
            xp: 0,
            streak: 0,
            badges: [],
            displayName: user?.displayName || user?.email?.split("@")[0] || "You",
            photoURL: user?.photoURL,
            email: user?.email,
          });
        }
      } catch (e) {
        setErrs((x) => ({ ...x, profile: niceError(e, "Couldn’t load profile.") }));
      }
    })();

    // Completed challenges (ownerId == uid), sorted client-side by updatedAt desc
    {
      const q1 = query(collection(db, "challenges"), where("ownerId", "==", uid));
      unsubs.push(
        onSnapshot(
          q1,
          (snap) => {
            const rows = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((x) => x.status === "completed")
              .sort((a, b) => tsToMs(b.updatedAt) - tsToMs(a.updatedAt));
            setCompletedChallenges(rows);
            setErrs((x) => ({ ...x, ch: null }));
          },
          (e) => setErrs((x) => ({ ...x, ch: niceError(e, "Couldn’t load challenges.") }))
        )
      );
    }

    // Completed teachbacks (assigneeId == uid), sorted client-side by updatedAt desc
    {
      const q2 = query(collection(db, "teachbacks"), where("assigneeId", "==", uid));
      unsubs.push(
        onSnapshot(
          q2,
          (snap) => {
            const rows = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((x) => x.status === "completed")
              .sort((a, b) => tsToMs(b.updatedAt) - tsToMs(a.updatedAt));
            setCompletedTeachbacks(rows);
            setErrs((x) => ({ ...x, tb: null }));
          },
          (e) => setErrs((x) => ({ ...x, tb: niceError(e, "Couldn’t load teach-backs.") }))
        )
      );
    }

    const t = setTimeout(() => setLoading(false), 350);
    return () => {
      unsubs.forEach((u) => u && u());
      clearTimeout(t);
    };
  }, [uid]);

  const level = useMemo(() => Math.floor((profile?.xp || 0) / 500) + 1, [profile?.xp]);
  const levelPct = useMemo(
    () => Math.round((((profile?.xp || 0) % 500) / 500) * 100),
    [profile?.xp]
  );

  return (
    <main className="min-h-[calc(100vh-60px)] bg-gray-50 px-6 md:px-12 py-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* Top bar with back */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <User className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Your portfolio</h1>
          </div>

          <motion.button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
        </div>

        {/* Profile summary */}
        <Card className="mb-6 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
          <CardHeader
            title="Profile summary"
            icon={<Award className="h-5 w-5" />}
          />
          <CardBody>
            {errs.profile && (
              <div className="mb-3 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span>{errs.profile}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt="Avatar"
                    className="h-14 w-14 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full grid place-items-center bg-indigo-50 text-indigo-700 font-bold border border-gray-200">
                    {(profile.displayName?.[0] || profile.email?.[0] || "U").toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {profile.displayName}
                  </div>
                  <div className="text-sm text-gray-600">{profile.email}</div>
                </div>
              </div>

              <div className="flex items-center justify-evenly">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Level</div>
                  <div className="text-xl font-bold text-gray-900">Lv. {level}</div>
                </div>
                <ProgressRing value={levelPct} label={`${(profile?.xp || 0) % 500} / 500 XP`} />
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Streak</div>
                  <div className="text-xl font-bold text-gray-900">{profile.streak}d</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-2">Badges</div>
              <div className="flex flex-wrap gap-2">
                {(profile.badges || []).length ? (
                  profile.badges.map((b, i) => (
                    <span
                      key={`${b}-${i}`}
                      className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                    >
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No badges yet</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Completed challenges */}
        <Card className="mb-6 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
          <CardHeader
            title="Completed challenges"
            icon={<Target className="h-5 w-5" />}
            action={
              <div className="text-xs text-gray-500">
                Total: {completedChallenges.length}
              </div>
            }
          />
          <CardBody>
            {errs.ch && (
              <div className="mb-2 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span>{errs.ch}</span>
              </div>
            )}

            <motion.div variants={listContainer} initial="hidden" animate="visible" className="space-y-3">
              {completedChallenges.map((c) => (
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
                      <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(tsToMs(c.updatedAt || c.createdAt)).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {!errs.ch && !loading && completedChallenges.length === 0 && (
              <div className="text-sm text-gray-500">You haven’t completed any challenges yet.</div>
            )}
          </CardBody>
        </Card>

        {/* Completed teach-backs */}
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70">
          <CardHeader
            title="Completed teach-backs"
            icon={<BookOpen className="h-5 w-5" />}
            action={
              <div className="text-xs text-gray-500">
                Total: {completedTeachbacks.length}
              </div>
            }
          />
          <CardBody>
            {errs.tb && (
              <div className="mb-2 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span>{errs.tb}</span>
              </div>
            )}

            <motion.div variants={listContainer} initial="hidden" animate="visible" className="space-y-3">
              {completedTeachbacks.map((t) => (
                <motion.div
                  key={t.id}
                  variants={listItem}
                  className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-md hover:-translate-y-0.5 transition flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-gray-900">{t.prompt}</div>
                    <div className="text-xs text-gray-600 mt-1">Requested by {t.requester || "—"}</div>
                    <div className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      <Flame className="h-3.5 w-3.5" /> Completed
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(tsToMs(t.updatedAt || t.createdAt)).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {!errs.tb && !loading && completedTeachbacks.length === 0 && (
              <div className="text-sm text-gray-500">No completed teach-backs yet.</div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </main>
  );
};

export default Portfolio;
