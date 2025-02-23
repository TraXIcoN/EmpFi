"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterTextProps {
  sentences: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetween?: number;
}

const TypewriterText = ({
  sentences,
  typingSpeed = 50,
  deletingSpeed = 30,
  delayBetween = 2000,
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const currentSentence = sentences[currentSentenceIndex];

    if (isDeleting) {
      if (displayedText === "") {
        setIsDeleting(false);
        setCurrentSentenceIndex((prev) => (prev + 1) % sentences.length);
        timeout = setTimeout(() => {}, delayBetween);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
      }
    } else {
      if (displayedText === currentSentence) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delayBetween);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(currentSentence.slice(0, displayedText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    displayedText,
    currentSentenceIndex,
    isDeleting,
    sentences,
    typingSpeed,
    deletingSpeed,
    delayBetween,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-20" // Fixed height to prevent layout shift
    >
      <span className="text-xl md:text-2xl text-gray-400">
        {displayedText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-5 bg-blue-500 ml-1"
        />
      </span>
    </motion.div>
  );
};

export default TypewriterText;
