"use client";

import { motion, useReducedMotion } from "motion/react";

/** Word-by-word rise-in, in the spirit of React Bits' SplitText. */
export default function Reveal({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} aria-hidden="true">
          {i > 0 && " "}
          <span className="reveal-mask">
            <motion.span
              className="reveal-word"
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.08 * i }}
            >
              {word}
            </motion.span>
          </span>
        </span>
      ))}
    </span>
  );
}
