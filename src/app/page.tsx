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
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              TheFOMOFund.tech
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>

        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent z-[-1]" />
      </section>

      {/* Description Section */}
      <section ref={ref} className="py-32 bg-black">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h2 className="text-5xl md:text-7xl font-bold">
              Step into the future of
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
                financial intelligence
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of investors and teams using TheFOMOFund to turn
              market insights into high-performing portfolios, fast.
            </p>
          </motion.div>

          <div className="mt-20">
            <ImageCarousel images={images} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 mb-8">
              <Lottie animationData={financialAnimation} loop={true} />
            </div>
            <p className="text-gray-400 text-center">
              © 2025 TheFOMOFund.tech. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
