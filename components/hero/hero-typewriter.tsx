"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { typography } from "@/lib/typography";

interface HeroTypewriterProps {
  strings: string[];
}

export default function HeroTypewriter({ strings }: HeroTypewriterProps) {
  const [text, setText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Typewriter logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const currentString = strings[stringIndex] ?? "";

    if (!isDeleting && text === currentString) {
      // Pause after typing fully
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && text === "") {
      // Pause before typing next
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setStringIndex((prev) => (prev + 1) % strings.length);
      }, 400);
    } else {
      // Typing or erasing
      const delay = isDeleting ? 35 : 60;
      timeout = setTimeout(() => {
        setText((prev) =>
          isDeleting
            ? currentString.substring(0, prev.length - 1)
            : currentString.substring(0, prev.length + 1)
        );
      }, delay);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, stringIndex]);

  // Blinking cursor logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      <p className={`mb-4 ${typography.heroKicker}`}>
        Hi, my name is
      </p>
      
      <h1 className={typography.heroName}>
        Talha Ahmad.
      </h1>

      <h2 className={`mt-5 ${typography.heroRole}`}>
        {text}
        <span
          className={`text-orangeWeb transition-opacity duration-75 ${
            cursorVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          |
        </span>
      </h2>
    </motion.div>
  );
}
