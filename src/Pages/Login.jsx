import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

// Proper Google "G" logo
const GoogleIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 533.5 544.3"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M533.5 278.4c0-17.4-1.5-34.2-4.4-50.4H272v95.5h146.9c-6.4 34.5-25.8 63.8-55 83.5v68h88.7c51.9-47.8 81.9-118.2 81.9-196.6z"
      fill="#4285f4"
    />
    <path
      d="M272 544.3c74.7 0 137.4-24.7 183.2-67l-88.7-68c-24.6 16.5-56 26-94.5 26-72.6 0-134.2-49-156.2-114.9H24.8v72.2c45.3 89.7 138.2 151.7 247.2 151.7z"
      fill="#34a853"
    />
    <path
      d="M115.8 320.4c-10.9-32.4-10.9-67.5 0-99.9V148.3H24.8c-39.6 78.6-39.6 171.2 0 249.8l91-77.7z"
      fill="#fbbc04"
    />
    <path
      d="M272 107.7c39.5 0 75 13.6 103 40.5l77.1-77.1C409.3 24.3 346.6 0 272 0 163 0 70.1 62 24.8 151.7l91 72.2c22-65.9 83.6-116.2 156.2-116.2z"
      fill="#ea4335"
    />
  </svg>
);

// helpers
const isValidEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const prettyError = (code, fallback = "Couldn’t sign you in. Please try again.") => {
  const map = {
    "auth/invalid-email": "That email address looks invalid.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/popup-closed-by-user": "Google popup closed before completing.",
    "auth/cancelled-popup-request": "Google popup was cancelled.",
    "auth/popup-blocked": "Your browser blocked the popup. Allow popups and try again.",
  };
  return map[code] || fallback;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [loading, setLoading] = useState({ email: false, google: false, reset: false });
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", general: "" });

  // forgot password UI state
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetErr, setResetErr] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "email") {
      if (!value) setErrors((er) => ({ ...er, email: "Email is required." }));
      else if (!isValidEmail(value)) setErrors((er) => ({ ...er, email: "Enter a valid email address." }));
      else setErrors((er) => ({ ...er, email: "" }));
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    const pwd = form.password;

    if (!email) return setErrors((er) => ({ ...er, email: "Email is required." }));
    if (!isValidEmail(email)) return setErrors((er) => ({ ...er, email: "Enter a valid email address." }));
    if (!pwd || pwd.length < 8) {
      return setErrors((er) => ({ ...er, general: "Please enter your password (8+ characters)." }));
    }

    try {
      setErrors({ email: "", general: "" });
      setLoading((s) => ({ ...s, email: true }));
      await signInWithEmailAndPassword(auth, email, pwd);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors((er) => ({ ...er, general: prettyError(err.code, err.message) }));
    } finally {
      setLoading((s) => ({ ...s, email: false }));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrors({ email: "", general: "" });
      setLoading((s) => ({ ...s, google: true }));
      await signInWithPopup(auth, googleProvider);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors((er) => ({ ...er, general: prettyError(err.code, err.message) }));
    } finally {
      setLoading((s) => ({ ...s, google: false }));
    }
  };

  const openReset = () => {
    setResetOpen((v) => !v);
    setResetEmail((prev) => prev || form.email); // pre-fill with login email
    setResetMsg("");
    setResetErr("");
  };

  const sendReset = async (e) => {
    e.preventDefault();
    const email = (resetEmail || "").trim();
    if (!isValidEmail(email)) {
      setResetErr("Enter a valid email address.");
      setResetMsg("");
      return;
    }
    try {
      setLoading((s) => ({ ...s, reset: true }));
      setResetErr("");
      setResetMsg("");
      await sendPasswordResetEmail(auth, email);
      setResetMsg(`Reset link sent to ${email}. Check your inbox.`);
    } catch (err) {
      const map = {
        "auth/user-not-found": "No account found with that email.",
        "auth/invalid-email": "That email address looks invalid.",
      };
      setResetErr(map[err.code] || "Couldn’t send reset email. Try again.");
      setResetMsg("");
    } finally {
      setLoading((s) => ({ ...s, reset: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center px-6 md:px-16 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 md:p-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Log in with email & password or continue with Google.</p>
        </div>

        {/* Error banner */}
        {errors.general && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
            {errors.general}
          </div>
        )}

        {/* Email / Password */}
        <form onSubmit={handleEmailLogin} noValidate className="space-y-5">
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
                "transition-colors",
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <button
                type="button"
                onClick={openReset}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={onChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-20 border-gray-300"
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
          </div>

          <button
            type="submit"
            disabled={loading.email}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading.email ? "Signing you in…" : "Log In"}
          </button>
        </form>

        {/* Forgot password panel */}
        {resetOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"
          >
            <p className="text-sm text-gray-700 mb-3">
              Enter your email and we’ll send a password reset link.
            </p>
            {resetMsg && (
              <div className="mb-3 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm">
                {resetMsg}
              </div>
            )}
            {resetErr && (
              <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">
                {resetErr}
              </div>
            )}
            <form onSubmit={sendReset} className="flex gap-2">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 border-gray-300 focus:ring-indigo-500 outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading.reset}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading.reset ? "Sending…" : "Send link"}
              </button>
            </form>
          </motion.div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-8">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-wider text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading.google}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-60"
        >
          {loading.google ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          ) : (
            <GoogleIcon />
          )}
          <span className="font-medium text-gray-800">
            {loading.google ? "Preparing Google…" : "Continue with Google"}
          </span>
        </button>

        {/* Create account CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-3">New to Empower360?</p>
          <Link
            to="/signup"
            className="inline-block px-6 py-2.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-medium transition"
          >
            Create Account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-8 text-center">
          By continuing, you agree to our{" "}
          <Link to="#" className="text-indigo-600 hover:underline">Terms</Link>{" "}
          and{" "}
          <Link to="#" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
