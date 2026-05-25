"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700"
      >
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          404
        </h2>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Page Not Found
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
