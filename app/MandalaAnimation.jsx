// MandalaAnimation.jsx
"use client";
import { motion } from "framer-motion";
export function MandalaAnimation() {
  return (
    <div className="w-64 h-64 relative flex items-center justify-center">
      <motion.div
        className="absolute w-full h-full rounded-full border border-amber-600/40"
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      />

      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-16 bg-amber-700 rounded-full origin-bottom"
          style={{ transform: `rotate(${i * 30}deg)` }}
          initial={{ scaleY: 0.3, opacity: 0.4 }}
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
          transition={{
            repeat: Infinity,
            duration: 4,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
      <motion.div
        className="w-10 h-10 rounded-full bg-amber-600"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
    </div>
  );
}
