"use client";

import React, { useState, useEffect } from "react";

interface RoleTyperProps {
  roles: string[];
  className?: string;
}

export default function RoleTyper({ roles, className = "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-display" }: RoleTyperProps) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Typing speed: 60-80ms (we'll use 70ms)
    // Deleting speed: 35-50ms (we'll use 45ms)
    const typeSpeed = 70;
    const deleteSpeed = 45;
    const pauseDelay = 1500; // Pause for 1.5s after full word is typed

    const fullText = roles[currentRoleIndex];

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      } else {
        timer = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deleteSpeed);
      }
    } else {
      if (currentText === fullText) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDelay);
      } else {
        timer = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        }, typeSpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentRoleIndex, roles]);

  return (
    <div className="inline-flex items-center min-w-[280px] md:min-w-[400px]">
      <span 
        className={`${className} h-[1.2em] inline-flex items-center mt-2`}
        style={{ color: "var(--text-primary, #000)" }}
      >
        {currentText}
        <span 
          className="ml-1 w-[3px] h-[1em] animate-blink"
          style={{
            backgroundColor: "var(--text-primary, #000)",
            animation: "blink 1s step-end infinite",
          }}
        />
      </span>
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
