import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // import for navigation
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import studentillus from "../assets/studentillus.png";

const Home = () => {
  const navigate = useNavigate(); // hook for navigation

  return (
    <div className="min-h-screen bg-white px-6 md:px-20 py-10">
      {/* Top Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center mb-12"
      >
        <h1 className="text-xl font-bold text-indigo-700">Empower360</h1>
        <Button
          onClick={() => navigate("/signup")} // navigate to signup page
          className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-transform hover:scale-105"
        >
          Join Now
        </Button>
      </motion.div>

      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-10 items-start">
        {/* Left side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center md:items-start text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Learn Better <br /> by Teaching Each Other
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-md">
            Empower360 is a peer-to-peer learning platform where you grow by
            creating, completing, and reflecting on structured challenges.
            Every challenge you take or teach contributes to your verified
            skill portfolio.
          </p>

          <motion.img
            src={studentillus}
            alt="Student Illustration"
            className="w-72 md:w-[26rem] mx-0 mt-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>

        {/* Right side cards */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-4"
        >
          {[
            {
              title: "Challenge Board",
              desc: "Example: “Explain Cloud Computing with a real-world analogy.”",
              footer: (
                <Button
                  size="sm"
                  className="bg-indigo-600 text-white hover:scale-105 transition-transform"
                >
                  Accept Challenge
                </Button>
              ),
            },
            {
              title: "Teach-Back",
              desc: "“Cloud computing is like renting a library instead of buying every book.”",
              footer: (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">+15 points earned</span>
                  <Button
                    size="sm"
                    className="bg-indigo-600 text-white hover:scale-105 transition-transform"
                  >
                    Mark Complete
                  </Button>
                </div>
              ),
            },
            {
              title: "Peer Feedback",
              desc: (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <img
                      src="https://randomuser.me/api/portraits/men/44.jpg"
                      alt="user"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">Lakshay</span>
                    <span className="text-yellow-500">★★★★★</span>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">
                    Great explanation! Clear and easy to relate.
                  </p>
                </>
              ),
            },
            {
              title: "Skill Portfolio",
              desc: (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Skills Verified</p>
                    <p className="font-medium">8</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Challenges Completed</p>
                    <p className="font-medium">15</p>
                  </div>
                </div>
              ),
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-sm rounded-xl cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{card.title}</h3>
                  <div className="text-sm text-gray-700 mb-2">{card.desc}</div>
                  {card.footer && card.footer}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Bottom Features */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mt-16 grid md:grid-cols-3 gap-8"
      >
        {[
          {
            title: "Learning Circles",
            desc: "Join or create micro-groups to post, attempt, and discuss challenges together.",
          },
          {
            title: "Gamification & Recognition",
            desc: "Earn points, collect badges, and showcase your growth on leaderboards.",
          },
          {
            title: "Create Challenges",
            desc: "Post challenges for others and learn when they explain it back to you.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-sm rounded-xl cursor-pointer">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
};

export default Home;
