import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const isValidEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ ok: false, msg: "" });
  const [loading, setLoading] = useState(false);

  // optional honeypot (hidden field to trap bots)
  const [hp, setHp] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    // live validation
    if (name === "name") {
      setErrors((er) => ({ ...er, name: value.trim() ? "" : "Name is required." }));
    } else if (name === "email") {
      setErrors((er) => ({
        ...er,
        email: !value.trim() ? "Email is required." : !isValidEmail(value) ? "Enter a valid email." : ""
      }));
    } else if (name === "message") {
      setErrors((er) => ({ ...er, message: value.trim() ? "" : "Message is required." }));
    }
  };

  const validate = () => {
    const e = {
      name: form.name.trim() ? "" : "Name is required.",
      email: !form.email.trim()
        ? "Email is required."
        : !isValidEmail(form.email)
        ? "Enter a valid email."
        : "",
      message: form.message.trim() ? "" : "Message is required.",
    };
    setErrors(e);
    return !e.name && !e.email && !e.message;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ ok: false, msg: "" });

    // honeypot: if filled, silently succeed
    if (hp) {
      setStatus({ ok: true, msg: "Thanks! Your message has been received." });
      setForm({ name: "", email: "", message: "" });
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);
      await addDoc(collection(db, "contactMessages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        createdAt: serverTimestamp(),
      });
      setStatus({ ok: true, msg: "Thanks! Your message has been sent. We’ll get back soon." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({
        ok: false,
        msg: "Couldn’t send your message right now. Please try again in a moment.",
      });
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-16 py-12 flex flex-col items-center">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 max-w-2xl"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-600">
          Have questions or ideas? We’d love to hear from you. Get in touch with
          the Empower360 team and let’s build better learning experiences
          together.
        </p>
      </motion.div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition w-full max-w-xl mb-12"
      >
        <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
          Send us a message
        </h2>

        {/* Status banners */}
        {status.msg ? (
          <div
            className={[
              "mb-4 rounded-lg px-4 py-3 text-sm",
              status.ok
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200",
            ].join(" ")}
          >
            {status.msg}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {/* Honeypot hidden field */}
          <input
            type="text"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            tabIndex="-1"
            autoComplete="off"
          />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={onChange}
              onBlur={onChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={[
                "w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none",
                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500",
                "transition-colors",
              ].join(" ")}
              required
              maxLength={100}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600" aria-live="polite">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              onBlur={onChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={[
                "w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none",
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500",
                "transition-colors",
              ].join(" ")}
              required
              maxLength={200}
              autoComplete="email"
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600" aria-live="polite">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              placeholder="Your message..."
              value={form.message}
              onChange={onChange}
              onBlur={onChange}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              className={[
                "w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none",
                errors.message ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500",
                "transition-colors",
              ].join(" ")}
              required
              maxLength={5000}
            />
            {errors.message && (
              <p id="message-error" className="mt-1 text-sm text-red-600" aria-live="polite">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition w-full max-w-xl"
      >
        <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
          Get in touch
        </h2>
        <div className="space-y-6 text-gray-700 text-center">
          <div className="flex items-center gap-4 justify-center">
            <Mail className="w-6 h-6 text-indigo-600" />
            <p>support@empower360.com</p>
          </div>
          <div className="flex items-center gap-4 justify-center">
            <Phone className="w-6 h-6 text-indigo-600" />
            <p>+91 98765 43210</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
