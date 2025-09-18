// src/Pages/Feedback.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Star,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/* -------------------- Motion presets -------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};
const subtle = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
const listItem = (i = 0) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, delay: 0.04 * i } },
});

/* ----------------------- Helpers ------------------------ */
const tsToMs = (ts) => (ts?.toMillis ? ts.toMillis() : (ts?.seconds || 0) * 1000);
const niceError = (err, fallback = "Something went wrong. Please try again.") => {
  const code = err?.code || "";
  const map = {
    "permission-denied": "You don’t have permission to access this feedback.",
    "not-found": "Feedback not found.",
    "unavailable": "Service is temporarily unavailable. Please retry.",
    "deadline-exceeded": "Request timed out. Please retry.",
    "failed-precondition":
      "This query needs an index. Reload and click the 'Create index' link if prompted.",
  };
  return map[code] || fallback;
};

/* --------- Lightweight placeholders for other tabs -------- */
const MOCK_RECEIVED = [
  { id: "r1", from: "Kabir", title: "Your Teach-back: Binary Search", rating: 5, when: "yesterday" },
  { id: "r2", from: "Riya", title: "Challenge: Data Modeling 101", rating: 4, when: "2d ago" },
];
const MOCK_REQUESTS = [
  { id: "rq1", requester: "Dev", title: "Review my SQL joins explainer", when: "4h ago" },
];

/* ======================================================= */
/*                       COMPONENT                         */
/* ======================================================= */
const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const uid = user?.uid;

  /* --------------------- List state ---------------------- */
  const [tab, setTab] = useState("toGive"); // toGive | received | requests
  const [q, setQ] = useState("");
  const [toGive, setToGive] = useState([]);
  const [listErr, setListErr] = useState(null);
  const [listLoading, setListLoading] = useState(true);

  // subscribe to feedbackQueue for current reviewer
  useEffect(() => {
    if (!uid) return;
    setListLoading(true);
    setListErr(null);

    const q1 = query(
      collection(db, "feedbackQueue"),
      where("reviewerId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q1,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            title: x.title,
            learner: x.learner || "—",
            points: Number(x.points || 0),
            status: x.status || "pending",
            createdAt: x.createdAt,
          };
        });
        setToGive(rows);
        setListErr(null);
        setListLoading(false);
      },
      (err) => {
        setListErr(niceError(err, "Couldn’t load your feedback queue."));
        setListLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  /* ------------------- List filtering -------------------- */
  const filtered = useMemo(() => {
    const base =
      tab === "toGive" ? toGive : tab === "received" ? MOCK_RECEIVED : MOCK_REQUESTS;
    if (!q.trim()) return base;

    const needle = q.toLowerCase();
    return base.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(needle))
    );
  }, [tab, q, toGive]);

  /* --------------------- Detail drawer ------------------- */
  const [detail, setDetail] = useState(null);
  const [detailErr, setDetailErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const load = async () => {
      setDetail(null);
      setDetailErr(null);
      setRating(0);
      setComment("");
      if (!id) return;

      try {
        const snap = await getDoc(doc(db, "feedbackQueue", id));
        if (!snap.exists()) {
          setDetailErr("Feedback not found.");
          return;
        }
        const data = snap.data();
        if (data.reviewerId !== uid) {
          setDetailErr("You don’t have permission to view this feedback.");
          return;
        }
        setDetail({ id: snap.id, ...data });
        if (data.rating) setRating(Number(data.rating));
        if (data.comment) setComment(String(data.comment));
      } catch (e) {
        setDetailErr(niceError(e));
      }
    };
    load();
  }, [id, uid]);

  const goDashboard = () => navigate("/dashboard");
  const closeDrawer = () => navigate("/feedback");

  const submitFeedback = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "feedbackQueue", detail.id), {
        status: "completed",
        rating: Number(rating || 0),
        comment: comment || "",
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "activity"), {
        userId: uid,
        type: "feedback",
        text: `Gave feedback on “${detail.title}” for ${detail.learner}`,
        createdAt: serverTimestamp(),
      });

      closeDrawer();
    } catch (e) {
      setDetailErr(niceError(e, "Could not submit feedback."));
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- Render helpers ------------------- */
  const renderStars = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          onClick={() => setRating(n)}
          className={`p-1 rounded hover:bg-yellow-100 ${
            rating >= n ? "text-yellow-500" : "text-gray-300"
          }`}
          title={`${n} star${n > 1 ? "s" : ""}`}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
        >
          <Star className="h-5 w-5 fill-current" />
        </motion.button>
      ))}
    </div>
  );

  const counts = {
    toGive: toGive.length,
    received: MOCK_RECEIVED.length,
    requests: MOCK_REQUESTS.length,
  };

  /* ======================================================= */
  /*                         RETURN                          */
  /* ======================================================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header with BACK (always to dashboard) */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <motion.button
              onClick={goDashboard}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Back to dashboard"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>

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
            <div className="px-3 py-2 rounded-lg bg-white border border-gray-100 text-center transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="text-xs text-gray-500">To give</div>
              <div className="text-sm font-semibold text-gray-900">{counts.toGive}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white border border-gray-100 text-center transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="text-xs text-gray-500">Received</div>
              <div className="text-sm font-semibold text-gray-900">{counts.received}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white border border-gray-100 text-center transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="text-xs text-gray-500">Requests</div>
              <div className="text-sm font-semibold text-gray-900">{counts.requests}</div>
            </div>
          </div>
        </motion.div>

        {/* Error banner for list */}
        {listErr && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
          >
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{listErr}</span>
          </motion.div>
        )}

        {/* Tabs + Search */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.06 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-gray-100">
              {[
                { key: "toGive", label: "To give" },
                { key: "received", label: "Received" },
                { key: "requests", label: "Requests" },
              ].map((t) => (
                <motion.button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-sm",
                    tab === t.key
                      ? "bg-white border border-gray-200 text-gray-900"
                      : "text-gray-700 hover:text-gray-900",
                  ].join(" ")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t.label}
                </motion.button>
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
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="divide-y divide-gray-100">
            {/* TO GIVE (Firestore-backed) */}
            {tab === "toGive" &&
              (listLoading ? (
                <div className="px-5 py-10 text-center text-sm text-gray-500">Loading…</div>
              ) : (
                filtered.map((f, i) => (
                  <motion.div
                    key={f.id}
                    {...listItem(i)}
                    className="px-5 py-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{f.title}</div>
                      <div className="text-xs text-gray-600 mt-1">For {f.learner}</div>
                      <div className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                        <Clock className="h-3.5 w-3.5" />{" "}
                        {new Date(tsToMs(f.createdAt)).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-600">+{f.points} XP</div>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to={`/feedback/${f.id}`}
                          className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-800 inline-flex items-center gap-1 transition"
                        >
                          {f.status === "completed" ? "Review again" : "Give feedback"}{" "}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              ))}

            {/* RECEIVED (mock preview) */}
            {tab === "received" &&
              filtered.map((r, i) => (
                <motion.div
                  key={r.id}
                  {...listItem(i)}
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

            {/* REQUESTS (mock preview) */}
            {tab === "requests" &&
              filtered.map((rq, i) => (
                <motion.div
                  key={rq.id}
                  {...listItem(i)}
                  className="px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-gray-900">{rq.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Requested by {rq.requester} · {rq.when}
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to={`/feedback/${rq.id}`}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-100 inline-flex items-center gap-1 transition"
                    >
                      Review <ChevronRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              ))}

            {filtered.length === 0 && !listLoading && (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                Nothing here yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ============== DETAIL DRAWER / OVERLAY ============== */}
      {id && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={closeDrawer}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl border-l border-gray-200"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={closeDrawer}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Back"
                  title="Back"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </motion.button>
                <h3 className="text-lg font-semibold text-gray-900">Give feedback</h3>
              </div>
              <motion.button
                onClick={goDashboard}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                title="Go to dashboard"
              >
                Dashboard
              </motion.button>
            </div>

            <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
              {detailErr && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <span>{detailErr}</span>
                </div>
              )}

              {!detail && !detailErr && (
                <div className="text-sm text-gray-500">Loading…</div>
              )}

              {detail && (
                <>
                  <div className="mb-5">
                    <div className="text-xs text-gray-500">For</div>
                    <div className="text-sm font-medium text-gray-900">
                      {detail.learner || "—"}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-xs text-gray-500">Title</div>
                    <div className="text-sm font-medium text-gray-900">
                      {detail.title}
                    </div>
                  </div>

                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Requested on</div>
                      <div className="text-sm text-gray-800">
                        {new Date(tsToMs(detail.createdAt)).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">+{Number(detail.points || 0)} XP</div>
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-medium text-gray-800 mb-1">Rating</div>
                    {renderStars()}
                  </div>

                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-800 mb-1">Comments</div>
                    <textarea
                      rows={6}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did they do well? What can be improved? Be specific and constructive."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <motion.button
                      onClick={closeDrawer}
                      className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                      disabled={saving}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={submitFeedback}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-800 disabled:opacity-60 transition"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? "Submitting…" : "Submit feedback"}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
