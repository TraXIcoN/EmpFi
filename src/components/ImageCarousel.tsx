"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ImageCarouselProps {
  images: string[];
  interval?: number;
}

const ImageCarousel = ({ images, interval = 5000 }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-xl">
      {images.map((image, index) => (
        <motion.div
          key={image}
          className="absolute w-full h-full"
          initial={{ opacity: 0, x: 100 }}
          animate={{
            opacity: currentIndex === index ? 1 : 0,
            x: currentIndex === index ? 0 : -100,
          }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ImageCarousel;
