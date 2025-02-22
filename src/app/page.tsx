"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Lottie from "lottie-react";
import { ImageCarousel } from "@/components/ImageCarousel";
import financialAnimation from "@/animations/financial.json";

export default function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const images = [
    "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/cd91ccf5-7f12-4054-9a07-a0edfb7ae114",
    "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c0f9efd9-d624-4867-9a51-6f8c85b20944",
    "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/1389a5af-0184-4ae9-bad0-23c474014fc6",
    "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/d3b3f8bd-251c-408c-9ae4-b1e2cb422ea5",
    "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/08d2ecab-d0a7-4e8b-b725-e3633cd59019",
    "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/4c97501a-b2e0-4e25-a056-188083b55029",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              TheFOMOFund.tech
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Don't miss out on the next big thing in DeFi
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={ref} className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-center mb-4">
              High-Precision Price Data with Integrated Risk Engine
            </h2>
            <p className="text-xl text-gray-400 text-center max-w-3xl mx-auto">
              Experience real-time market analysis powered by advanced AI
            </p>
          </motion.div>

          <ImageCarousel images={images} />
        </div>
      </section>

      {/* Footer with Lottie Animation */}
      <footer className="bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 mb-8">
              <Lottie animationData={financialAnimation} loop={true} />
            </div>
            <p className="text-gray-400 text-center">
              © 2024 TheFOMOFund.tech. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
