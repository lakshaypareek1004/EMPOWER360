import React from "react";
import { motion } from "framer-motion";
import { Users, MessageSquare, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Community = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-16 py-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to the Community
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect with peers, share knowledge, and grow together.  
          Join learning circles, discuss challenges, and celebrate achievements.  
        </p>
      </motion.div>

      {/* Sections */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Learning Circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
        >
          <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Learning Circles</h3>
          <p className="text-sm text-gray-600">
            Join micro-groups to collaborate on challenges, share resources, and
            study together.
          </p>
        </motion.div>

        {/* Discussions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
        >
          <MessageSquare className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Discussions</h3>
          <p className="text-sm text-gray-600">
            Ask questions, give feedback, and engage in meaningful conversations
            with peers.
          </p>
        </motion.div>

        {/* Recognition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
        >
          <Award className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Recognition</h3>
          <p className="text-sm text-gray-600">
            Earn badges, climb leaderboards, and showcase your contributions in
            the community.
          </p>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-center mt-16"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Be a Part of Something Bigger
        </h2>
        <p className="text-gray-600 mb-6">
          Start your journey today. Join discussions, share your knowledge, and
          learn with peers.
        </p>
        <Link
          to="/signup"
         className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition">
          Join the Community
        </Link>
      </motion.div>
    </div>
  );
};

export default Community;
