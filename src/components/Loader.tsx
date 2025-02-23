"use client"; // Add this to make it a client component

import Lottie from "lottie-react";
import loadingAnimation from "@/animations/loading.json";

export function Loader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-32 h-32">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
        </div>
        {/* Lottie animation */}
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          className="w-full h-full"
        />
      </div>
      <p className="mt-4 text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
