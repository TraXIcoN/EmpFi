"use client"; // Add this to make it a client component

import { motion } from "framer-motion";

export function Loader() {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div
          className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"
          style={{ animationDuration: "1.5s" }}
        ></div>
      </div>
    </motion.div>
  );
}
