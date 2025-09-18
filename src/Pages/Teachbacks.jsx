// src/Pages/Teachbacks.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { BookOpen, Clock, AlertCircle } from "lucide-react";

/* Motion presets */
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

/* Helpers */
const tsToMs = (ts) => (ts?.toMillis ? ts.toMillis() : (ts?.seconds || 0) * 1000);
const daysLeft = (tsMs) => Math.max(0, Math.ceil((tsMs - Date.now()) / (1000 * 60 * 60 * 24)));

const Teachbacks = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Load teachbacks assigned to me (no orderBy; sort client-side) */
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setErr(null);

    const q = query(
      collection(db, "teachbacks"),
      where("assigneeId", "==", uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // sort by dueTs ascending on client to avoid composite index
        data.sort((a, b) => {
          const ams = tsToMs(a.dueTs);
          const bms = tsToMs(b.dueTs);
          return ams - bms;
        });
        setRows(data);
        setLoading(false);
      },
      (e) => {
        setErr("Couldn’t load teach-backs.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  const startOrContinue = async (tb) => {
    try {
      if (tb.status === "pending") {
        await updateDoc(doc(db, "teachbacks", tb.id), {
          status: "in_progress",
          updatedAt: serverTimestamp(),
        });
      }
      navigate(`/teachbacks/${tb.id}/work`);
    } catch (e) {
      setErr("Couldn’t open this teach-back. Please try again.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-gray-50 px-6 md:px-12 py-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Your teach-backs</h1>
          </div>

          {/* Back to dashboard */}
          <motion.button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
        </div>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 border border-red-200 p-3 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>{err}</div>
          </div>
        )}

        <motion.div variants={listContainer} initial="hidden" animate="visible" className="space-y-3">
          {rows.map((t) => (
            <motion.div
              key={t.id}
              variants={listItem}
              className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200/70 hover:shadow-md hover:-translate-y-0.5 transition flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-medium text-gray-900">{t.prompt || "Untitled"}</div>
                <div className="text-xs text-gray-600 mt-1">Requested by {t.requester || "—"}</div>
                <div className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                  <Clock className="h-3.5 w-3.5" /> Due in {daysLeft(tsToMs(t.dueTs))}d
                </div>
              </div>
              <motion.button
                onClick={() => startOrContinue(t)}
                className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.status === "in_progress" ? "Continue" : "Start"}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {!err && !loading && rows.length === 0 && (
          <div className="mt-6 text-sm text-gray-500">No teach-backs assigned right now.</div>
        )}

        {loading && <div className="mt-6 text-sm text-gray-500">Loading…</div>}
      </motion.div>
    </main>
  );
};

export default Teachbacks;
