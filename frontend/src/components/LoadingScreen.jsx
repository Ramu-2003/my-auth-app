import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

// Use existing images from public/assets
const LOADING_STAGES = [
  {
    image: '/assets/HUMANS-LOAD-BG.png',
    title: "Humans",
    subtitle: "Connecting with humanity...",
    bgColor: "#dbeafe",
    barColor: "#2563eb",
    titleColor: "#1e40af",
    subtitleColor: "#3b82f6",
  },
  {
    image: '/assets/ROBOTS-LOAD-BG.png',
    title: "Robots",
    subtitle: "Initializing machine protocols...",
    bgColor: "#fee2e2",
    barColor: "#dc2626",
    titleColor: "#991b1b",
    subtitleColor: "#ef4444",
  },
  {
    image: '/assets/GRIM-REAPER-LOAD-BG.png',
    title: "System",
    subtitle: "Finalizing configuration...",
    bgColor: "#d1fae5",
    barColor: "#059669",
    titleColor: "#065f46",
    subtitleColor: "#10b981",
  },
];

const LoadingScreen = ({ onComplete, duration = 30000 }) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + (100 / (duration / 80)), 100);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  // Each stage is 10 seconds (33.33% each)
  useEffect(() => {
    let stage = 0;
    if (progress > 33.33 && progress <= 66.66) stage = 1;
    else if (progress > 66.66) stage = 2;
    setCurrentStage(stage);
  }, [progress]);

  const stage = LOADING_STAGES[currentStage];
  const roundedProgress = Math.round(progress);

  return (
    <div 
      className="loading-screen"
      style={{ backgroundColor: stage.bgColor }}
    >
      {/* Main image */}
      <div className="loading-image-container">
        <img 
          src={stage.image} 
          alt={stage.title}
          className="loading-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Bottom shadow gradient */}
      <div 
        className="loading-shadow"
        style={{ background: `linear-gradient(to top, ${stage.bgColor} 38%, transparent 100%)` }}
      />

      {/* Bottom UI content */}
      <div className="loading-content">
        {/* Title */}
        <h1 style={{ color: stage.titleColor }}>
          {LOADING_STAGES[currentStage].title}
        </h1>

        {/* Subtitle */}
        <p style={{ color: stage.subtitleColor }}>
          {LOADING_STAGES[currentStage].subtitle}
        </p>

        {/* Progress row */}
        <div className="loading-progress-row">
          <span style={{ color: stage.subtitleColor }}>Loading</span>
          <span style={{ color: stage.barColor }}>{roundedProgress}%</span>
        </div>

        {/* Progress bar */}
        <div className="loading-bar-track">
          <div 
            className="loading-bar-fill"
            style={{ 
              width: `${progress}%`,
              background: stage.barColor
            }}
          />
        </div>

        {/* Stage dots */}
        <div className="loading-dots">
          {LOADING_STAGES.map((_, i) => (
            <div 
              key={i}
              className="loading-dot"
              style={{
                width: i === currentStage ? 24 : 8,
                backgroundColor: i === currentStage ? stage.barColor : 'rgba(0,0,0,0.2)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
