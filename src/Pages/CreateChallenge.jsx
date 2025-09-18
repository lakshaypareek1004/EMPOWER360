// src/Pages/CreateChallenge.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft } from "lucide-react";

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
    transition: { when: "beforeChildren", staggerChildren: 0.07 },
  },
};
const listItem = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
};

const CreateChallenge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [days, setDays] = useState(3);
  const [prompt, setPrompt] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const resetError = () => setErr("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetError();

    if (!user) {
      setErr("You must be logged in to create a challenge.");
      return;
    }
    if (!title.trim() || !topic.trim()) {
      setErr("Please provide both a title and topic.");
      return;
    }

    setSubmitting(true);
    try {
      const dueTs = Date.now() + Number(days || 1) * 24 * 60 * 60 * 1000;

      // 1) Create a challenge owned by the current user
      const challengePayload = {
        ownerId: user.uid,
        title: title.trim(),
        topic: topic.trim(),
        level,
        status: "open",
        dueTs,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Optional fields allowed by your rules
        author: user.displayName || (user.email?.split("@")[0] ?? "Anonymous"),
        points: 25,
        tags: [],
        description: prompt || "",
      };

      const challengesRef = collection(db, "challenges");
      const chDoc = await addDoc(challengesRef, challengePayload);

      // 2) Try to auto-assign ONE other available user from /profiles
      const profilesRef = collection(db, "profiles");
      const snap = await getDocs(query(profilesRef, limit(25)));
      const candidates = snap.docs
        .map((d) => d.id)
        .filter((uid) => uid && uid !== user.uid);

      if (candidates.length > 0) {
        const assigneeId =
          candidates[Math.floor(Math.random() * candidates.length)];

        // 2a) Create teach-back assignment for the selected assignee
        const teachbacksRef = collection(db, "teachbacks");
        await addDoc(teachbacksRef, {
          assigneeId,
          requesterId: user.uid,
          prompt: prompt || `Teach back: ${title.trim()}`,
          dueTs,
          status: "pending",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          challengeId: chDoc.id,
        });

        // 2b) Optional: activity entries for both users
        await addDoc(collection(db, "activity"), {
          userId: user.uid,
          type: "challenge",
          text: `Created challenge “${title.trim()}”`,
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "activity"), {
          userId: assigneeId,
          type: "teachback",
          text: `Assigned to teach back “${title.trim()}”`,
          createdAt: serverTimestamp(),
        });
      } else {
        // No other users found — challenge still created.
        await addDoc(collection(db, "activity"), {
          userId: user.uid,
          type: "challenge",
          text: `Created challenge “${title.trim()}” (no assignee available yet)`,
          createdAt: serverTimestamp(),
        });
      }

      // Navigate to challenges list (or dashboard)
      navigate("/challenges");
    } catch (e) {
      console.error(e);
      setErr(
        e?.message ||
          "You don’t have permission to create this challenge. Check Firestore rules."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-60px)] bg-gray-50 px-6 md:px-12 py-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200/70"
      >
        {/* Top row: Back button */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 transition"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>
        </motion.div>

        <motion.h1
          className="text-2xl font-bold text-gray-900 mb-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          Create challenge
</motion.h1>

        <motion.p
          className="text-gray-600 mb-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.04 }}
        >
          Define a clear prompt, difficulty, and expected outcome. You can refine it later.
        </motion.p>

        {err ? (
          <motion.div
            className="mb-4 rounded-lg bg-red-50 text-red-700 border border-red-200 p-3 text-sm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {err}
          </motion.div>
        ) : null}

        <motion.form
          className="space-y-5"
          onSubmit={handleSubmit}
          variants={listContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={listItem}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Explain Recursion via a story"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              onFocus={resetError}
              required
            />
          </motion.div>

          <motion.div variants={listItem}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Algorithms / DS / SQL / etc."
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              onFocus={resetError}
              required
            />
          </motion.div>

          <motion.div variants={listItem} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due (days)</label>
              <input
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="3"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              />
            </div>
          </motion.div>

          <motion.div variants={listItem}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt / Instructions</label>
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe exactly what the learner should teach back…"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
            />
          </motion.div>

          <motion.div
            variants={listItem}
            className="flex items-center justify-end gap-3 pt-2"
          >
            <motion.button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              onClick={() => window.history.back()}
              disabled={submitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={submitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? "Creating…" : "Create"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </main>
  );
};

export default CreateChallenge;
