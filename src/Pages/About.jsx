import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-16 py-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Empower360</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Empower360 is a peer-to-peer learning platform that redefines how
          students build knowledge. Instead of passive learning, our platform
          makes learning active, collaborative, and verifiable.
        </p>
      </motion.div>

      {/* Mission + Vision Section */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Our Mission</h2>
          <p className="text-gray-600">
            To empower students to learn by teaching others, gaining real
            understanding, and building confidence through structured
            peer-to-peer challenges.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Our Vision</h2>
          <p className="text-gray-600">
            A world where learning is not limited to classrooms but happens
            anytime, anywhere, through the power of peer collaboration and
            shared challenges.
          </p>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
        >
          <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Structured Challenges</h3>
          <p className="text-sm text-gray-600">
            Move beyond random discussions. Learn through well-structured,
            trackable challenges.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
        >
          <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Peer-to-Peer Learning</h3>
          <p className="text-sm text-gray-600">
            Teach to learn. Every challenge is an opportunity to strengthen your
            own understanding.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
        >
          <Award className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Verified Skills</h3>
          <p className="text-sm text-gray-600">
            Build a peer-validated skill portfolio with feedback, points, and
            badges.
          </p>
        </motion.div>
      </div>

      {/* Closing CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-center mt-20"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Together, We Learn Better
        </h2>
        <p className="text-gray-600 mb-6">
          Empower360 isn’t just another platform. It’s a movement to make
          learning interactive, collaborative, and meaningful.
        </p>
        <Link
        to={"/signup"}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition">
          Join the Movement
        </Link>
      </motion.div>
    </div>
  );
};

export default About;
