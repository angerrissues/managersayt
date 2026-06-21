"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Skip rendering on touch/mobile devices that have no fine pointer
    const hasPointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    if (!hasPointer) {
      setIsTouchDevice(true);
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const tagName = target.tagName.toLowerCase();
      
      // Check for inputs
      if (tagName === "input" || tagName === "textarea") {
        setIsInputHovered(true);
        setIsHovered(false);
      } 
      // Check for buttons/links
      else if (
        tagName === "a" ||
        tagName === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("magnetic")
      ) {
        setIsHovered(true);
        setIsInputHovered(false);
      } else {
        setIsHovered(false);
        setIsInputHovered(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Don't render anything on touch devices
  if (isTouchDevice) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference bg-white"
      animate={{
        x: mousePosition.x - (isInputHovered ? 2 : isHovered ? 24 : 12),
        y: mousePosition.y - (isInputHovered ? 16 : isHovered ? 24 : 12),
        width: isInputHovered ? 4 : isHovered ? 48 : 24,
        height: isInputHovered ? 32 : isHovered ? 48 : 24,
        borderRadius: isInputHovered ? "4px" : "50%",
      }}
      transition={{
        type: "tween",
        duration: 0, // Убираем замедление (lag)
      }}
    />
  );
}
