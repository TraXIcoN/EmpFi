"use client"; // Add this to make it a client component

import { Loader } from "@/components/Loader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader />
    </div>
  );
}
