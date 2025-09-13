import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

// Proper Google "G" logo
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M533.5 278.4c0-17.4-1.5-34.2-4.4-50.4H272v95.5h146.9c-6.4 34.5-25.8 63.8-55 83.5v68h88.7c51.9-47.8 81.9-118.2 81.9-196.6z" fill="#4285f4"/>
    <path d="M272 544.3c74.7 0 137.4-24.7 183.2-67l-88.7-68c-24.6 16.5-56 26-94.5 26-72.6 0-134.2-49-156.2-114.9H24.8v72.2c45.3 89.7 138.2 151.7 247.2 151.7z" fill="#34a853"/>
    <path d="M115.8 320.4c-10.9-32.4-10.9-67.5 0-99.9V148.3H24.8c-39.6 78.6-39.6 171.2 0 249.8l91-77.7z" fill="#fbbc04"/>
    <path d="M272 107.7c39.5 0 75 13.6 103 40.5l77.1-77.1C409.3 24.3 346.6 0 272 0 163 0 70.1 62 24.8 151.7l91 72.2c22-65.9 83.6-116.2 156.2-116.2z" fill="#ea4335"/>
  </svg>
);

// email validator
const isValidEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// map Firebase error codes to friendly messages
const prettyError = (code, fallback = "Something went wrong. Please try again.") => {
  const map = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/operation-not-allowed": "Email/password accounts are disabled.",
    "auth/weak-password": "Password is too weak. Use 8+ characters.",
    "auth/popup-closed-by-user": "Google popup closed before completing.",
    "auth/cancelled-popup-request": "Popup request cancelled.",
  };
  return map[code] || fallback;
};

const Signup = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState({ email: false, google: false });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({ email: "", password: "", confirm: "", general: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "email") {
      if (!value) setErrors((er) => ({ ...er, email: "Email is required." }));
      else if (!isValidEmail(value)) setErrors((er) => ({ ...er, email: "Enter a valid email address." }));
      else setErrors((er) => ({ ...er, email: "" }));
    }
  };

  const validate = () => {
    const e = { email: "", password: "", confirm: "", general: "" };
    if (!form.fullName.trim()) e.general = "Please enter your full name.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Use at least 8 characters.";
    if (!form.confirm) e.confirm = "Please confirm your password.";
    else if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return !e.email && !e.password && !e.confirm && !e.general;
    };
  
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading((s) => ({ ...s, email: true }));
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      if (form.fullName.trim()) {
        await updateProfile(cred.user, { displayName: form.fullName.trim() });
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors((er) => ({ ...er, general: prettyError(err.code, err.message) }));
    } finally {
      setLoading((s) => ({ ...s, email: false }));
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading((s) => ({ ...s, google: true }));
      await signInWithPopup(auth, googleProvider); // works for new or existing users
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors((er) => ({ ...er, general: prettyError(err.code, err.message) }));
    } finally {
      setLoading((s) => ({ ...s, google: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center px-6 md:px-16 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-gray-600">
            Join Empower360 and start learning by teaching.
          </p>
        </div>

        {/* Error banner */}
        {errors.general && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
            {errors.general}
          </div>
        )}

        {/* Email Signup */}
        <form onSubmit={handleEmailSignup} noValidate className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Your Name"
              value={form.fullName}
              onChange={onChange}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              onBlur={onChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={[
                "w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none",
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500",
                "transition-colors"
              ].join(" ")}
              required
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600" aria-live="polite">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={form.password}
                onChange={onChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-24 border-gray-300"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-pressed={showPwd}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 rounded-md"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Use 8+ characters.</p>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={onChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-24 border-gray-300"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-pressed={showConfirm}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 rounded-md"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirm && (
              <p className="mt-1 text-sm text-red-600" aria-live="polite">
                {errors.confirm}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading.email}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading.email ? "Creating your account…" : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-8">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-wider text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading.google}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-60"
        >
          {loading.google ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          ) : (
            <GoogleIcon />
          )}
          <span className="font-medium text-gray-800">
            {loading.google ? "Preparing Google…" : "Sign up with Google"}
          </span>
        </button>

        {/* Existing user CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-2">Already have an account?</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-medium transition"
          >
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
