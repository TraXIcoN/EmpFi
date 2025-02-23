"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect, useContext } from "react";
import Lottie from "lottie-react";
import { ImageCarousel } from "@/components/ImageCarousel";
import financialAnimation from "@/animations/financial.json";
import analysisAnimation from "@/animations/magnifying.json";
import portfolioAnimation from "@/animations/document.json";
import insightsAnimation from "@/animations/future.json";
import TypewriterText from "@/components/TypewriterText";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Loader } from "@/components/Loader";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [animationComplete, setAnimationComplete] = useState(false);

  const textLeft = "TheFOMO";
  const textRight = "Fund.tech";

  const images = [
    "gen_insigts.jpg",
    "insights_wizards.jpg",
    "smart_finance.jpg",
  ];

  const howItWorksSentences = [
    "Analyze market trends in real-time with AI.",
    "Get personalized investment recommendations.",
    "Stay ahead with predictive insights.",
    "Make data-driven investment decisions.",
  ];

  const handleGetStarted = async () => {
    if (user) {
      router.push("/dashboard");
    } else {
      window.location.href = "/api/auth/login";
    }
  };

  useEffect(() => {
    if (inView) {
      // Handle inView changes
    }
  }, [inView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Random animated gradients */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[500px] h-[500px] rounded-full opacity-30 mix-blend-screen"
              style={{
                background: `radial-gradient(circle, ${
                  i % 2 === 0 ? "#4ade80" : "#60a5fa"
                } 0%, transparent 70%)`,
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
                scale: [1, 1.5, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
            />
          ))}
        </div>

        <div className="container max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center items-center space-x-1">
            {/* Left part of text */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              onAnimationComplete={() => setAnimationComplete(true)}
              className="text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500"
            >
              {textLeft}
            </motion.div>

            {/* Right part of text */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400"
            >
              {textRight}
            </motion.div>
          </div>

          {/* Add TypewriterText here, before the button */}
          <div className="mt-8 mb-12">
            <TypewriterText
              sentences={[
                "What will happen to Tesla if the US decides to engage with North Korea? 🚀",
                "Will Louis Vuitton's stock surge if Kendrick headlines the Super Bowl? 💼",
                "When is the next housing market correction predicted? 🏘️",
                "Which crypto will dominate in the next bull run? 📈",
              ]}
              typingSpeed={40}
              deletingSpeed={20}
              delayBetween={3000}
            />
          </div>

          {/* Button appears after text animation */}
          <AnimatePresence>
            {animationComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12"
              >
                <motion.button
                  onClick={handleGetStarted}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                  className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Additional animated elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-black relative z-10">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
                How It Works
              </span>
            </h2>
          </motion.div>

          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                AI-Powered Analysis
              </h3>
              <p className="text-xl text-gray-400">
                Our advanced AI analyzes market trends, news, and data in
                real-time to identify potential investment opportunities before
                they become mainstream.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="h-48 w-48 mx-auto"
            >
              <Lottie
                animationData={analysisAnimation}
                loop={true}
                style={{ height: "100%", width: "100%" }}
              />
            </motion.div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="h-48 w-48 mx-auto md:order-1 order-2"
            >
              <Lottie
                animationData={portfolioAnimation}
                loop={true}
                style={{ height: "100%", width: "100%" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 md:order-2 order-1"
            >
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400">
                Smart Portfolio Management
              </h3>
              <p className="text-xl text-gray-400">
                Get personalized portfolio recommendations based on your risk
                tolerance and investment goals, with real-time rebalancing
                suggestions.
              </p>
            </motion.div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Market Insights & Predictions
              </h3>
              <p className="text-xl text-gray-400">
                Stay ahead of market movements with AI-generated insights and
                predictions, helping you make informed investment decisions at
                the right time.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="h-48"
            >
              <Lottie animationData={insightsAnimation} loop={true} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section ref={ref} className="py-32 bg-black relative z-10">
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
      <footer className="bg-black py-12 border-t border-gray-800 relative z-10">
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
