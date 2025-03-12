"use client";

import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode, isLoaded } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only show the toggle after hydration to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted || !isLoaded) return null;

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-card border border-border shadow-md hover:shadow-lg transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
      
      <div className="relative w-6 h-6 overflow-hidden">
        {/* Sun icon with animation */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute inset-0 h-6 w-6 text-yellow-400 transition-transform duration-500 ${isDarkMode ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        
        {/* Moon icon with animation */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute inset-0 h-6 w-6 text-indigo-400 transition-transform duration-500 ${!isDarkMode ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>
    </button>
  );
}
