import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 256 256" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Left blue bar */}
      <path d="M40 90V180C40 185 45 190 50 190H55V80H50C45 80 40 85 40 90Z" fill="#0056b3" />
      
      {/* Book-into-P shape */}
      <path d="M65 80V190C65 190 85 180 120 180C140 180 160 190 160 190V80C160 110 140 120 120 120C100 120 85 110 85 110V80H65Z" fill="#003d82" />
      <path d="M85 110C85 110 100 120 120 120C140 120 160 110 160 80C160 60 145 40 120 40C90 40 70 60 65 80H85V110Z" fill="#0056b3" />

      {/* Graduation Cap */}
      <path d="M110 25L50 55L110 85L170 55L110 25Z" fill="#ff9800" />
      <path d="M150 55V85" stroke="#ff9800" strokeWidth="4" strokeLinecap="round" />
      <circle cx="150" cy="90" r="4" fill="#ff9800" />
      <path d="M80 55V70C80 75 90 80 110 80C130 80 140 75 140 70V55H80Z" fill="#e68a00" />

      {/* Swooping Arrow */}
      <path 
        d="M30 180C30 180 50 120 150 50" 
        stroke="#ff9800" 
        strokeWidth="14" 
        strokeLinecap="round" 
        fill="none" 
      />
      <path d="M140 45L165 40L155 65L140 45Z" fill="#ff9800" />

      {/* Spark */}
      <path 
        d="M175 40L185 20L195 40L215 50L195 60L185 80L175 60L155 50L175 40Z" 
        fill="#ff9800" 
      />
    </svg>
  );
}
