import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"
import { HeartPulse, Brain } from "lucide-react";

export default function LandingPage() {
     const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue text-gray-800 px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-extrabold text-center mb-4"
      >
        CuraLink
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-lg sm:text-xl text-center max-w-xl mb-8 text-gray-600"
      >
        An AI-powered platform that connects <span className="font-semibold text-gray-900">patients</span> 
        and <span className="font-semibold text-gray-900">researchers</span> to simplify the discovery of 
        clinical trials, medical publications, and health experts.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
         onClick={() => navigate("/patients")}
        className="w-64 py-6 text-lg font-medium bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-md">
             <HeartPulse className="mr-2 h-5 w-5 inline" />
             I am a Patient 
        </button>


        <button 
        onClick={() => navigate("/researchers")}
        className="w-64 py-6 text-lg font-medium bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-md">
            <Brain className="mr-2 h-5 w-5 inline" />
            I am a Researcher
        </button>


      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-6 text-sm text-gray-400"
      >
        © {new Date().getFullYear()} CuraLink • Connecting Science & Care
      </motion.footer>
    </div>
  );
}
