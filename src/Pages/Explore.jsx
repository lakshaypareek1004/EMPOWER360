import React from "react";
import { motion } from "framer-motion";

const courses = [
  {
    id: 1,
    title: "Introduction to AI",
    description: "Learn the basics of artificial intelligence and machine learning.",
  },
  {
    id: 2,
    title: "Web Development",
    description: "Master HTML, CSS, JavaScript, and modern web frameworks.",
  },
  {
    id: 3,
    title: "Cybersecurity Fundamentals",
    description: "Understand the essentials of protecting networks and systems.",
  },
  {
    id: 4,
    title: "Data Science with Python",
    description: "Analyze and visualize data using Python tools and libraries.",
  },
  {
    id: 5,
    title: "UI/UX Design",
    description: "Learn to create intuitive and beautiful user interfaces.",
  },
];

const Explore = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-16 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Courses</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Browse a variety of courses uploaded by our community. Empower yourself with knowledge and share what you know.
        </p>
      </motion.div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: course.id * 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">{course.title}</h2>
            <p className="text-gray-700">{course.description}</p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">
              View Course
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
