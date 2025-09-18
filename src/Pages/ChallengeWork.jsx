// src/Pages/ChallengeWork.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc, getDoc, updateDoc, serverTimestamp, addDoc, collection
} from "firebase/firestore";
import { AlertCircle, ArrowLeft } from "lucide-react";

// Animation presets
const container = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.06 },
  },
};
const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: "easeOut" } },
};

const ChallengeWork = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "challenges", id));
        if (!snap.exists()) {
          setErr("Challenge not found");
          return;
        }
        setChallenge({ id: snap.id, ...snap.data() });
      } catch (e) {
        setErr("Failed to load challenge.");
      }
    })();
  }, [id]);

  const postActivity = async (text) => {
    try {
      await addDoc(collection(db, "activity"), {
        userId: user.uid,
        text,
        type: "challenge",
        createdAt: serverTimestamp()
      });
    } catch {}
  };

  const saveProgress = async () => {
    if (!challenge) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "challenges", challenge.id), {
        notes: notes || "",
        status: "in_progress",
        updatedAt: serverTimestamp(),
      });
      await postActivity(`Saved progress on "${challenge.title}"`);
    } catch (e) {
      setErr("Could not save progress.");
    } finally {
      setSaving(false);
    }
  };

  const markComplete = async () => {
    if (!challenge) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "challenges", challenge.id), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
      await postActivity(`Completed "${challenge.title}"`);
      navigate("/dashboard");
    } catch (e) {
      setErr("Could not mark complete.");
    } finally {
      setSaving(false);
    }
  };

  if (err) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-4 flex gap-2 items-start">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>{err}</div>
        </div>
      </div>
    );
  }

  if (!challenge) return <div className="max-w-3xl mx-auto p-6">Loading…</div>;

  return (
    <main className="min-h-[calc(100vh-60px)] bg-gray-50 px-6 md:px-12 py-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200/70"
      >
        {/* Back button (top-left) */}
        <motion.button
          variants={item}
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-gray-700 mb-4 px-2 py-1 rounded-md hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>

        <motion.h1 variants={item} className="text-2xl font-bold text-gray-900">
          Work on: {challenge.title}
        </motion.h1>
        <motion.p variants={item} className="text-gray-600 mt-1">
          Topic: {challenge.topic} · Level: {challenge.level}
        </motion.p>

        {challenge.prompt && (
          <motion.div
            variants={item}
            className="mt-4 p-4 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100 hover:border-indigo-200 transition-colors"
          >
            <div className="font-medium">Prompt</div>
            <div className="text-sm mt-1">{challenge.prompt}</div>
          </motion.div>
        )}

        <motion.div variants={item} className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your working notes / draft (optional)
          </label>
          <textarea
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Summarize your explanation, paste links, outline your teach-back..."
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none border-gray-300 transition-all hover:border-indigo-300"
          />
        </motion.div>

        <motion.div variants={item} className="flex items-center justify-end gap-3 mt-6">
          <motion.button
            onClick={saveProgress}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-60 transition-colors shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            Save progress
          </motion.button>
          <motion.button
            onClick={markComplete}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            Mark complete
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default ChallengeWork;
