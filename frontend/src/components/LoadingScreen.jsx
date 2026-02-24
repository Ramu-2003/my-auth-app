import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

// Loading stages - 10 seconds each, 30 seconds total
const LOADING_STAGES = [
  {
    image: '/assets/HUMANS-LOAD-BG.png',
    title: "Humans",
    subtitle: "Connecting with humanity...",
    bgColor: "#dbeafe",
    barColor: "#2563eb",
    titleColor: "#1e40af",
    subtitleColor: "#3b82f6",
    objectFit: "cover",
  },
  {
    image: '/assets/ROBOTS-LOAD-BG.png',
    title: "Robots",
    subtitle: "Initializing machine protocols...",
    bgColor: "#fee2e2",
    barColor: "#dc2626",
    titleColor: "#991b1b",
    subtitleColor: "#ef4444",
    objectFit: "cover",
  },
  {
    image: '/assets/GRIM-REAPER-LOAD-BG.png',
    title: "System",
    subtitle: "Finalizing configuration...",
    bgColor: "#d1fae5",
    barColor: "#059669",
    titleColor: "#065f46",
    subtitleColor: "#10b981",
    objectFit: "cover",
  },
];

const LoadingScreen = ({ onComplete, duration = 30000 }) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  // Progress timer - updates every 80ms
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

  // Call onComplete when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  // Stage transitions:
  // Stage 0 (Humans): 0% to 33.33% (0-10 seconds)
  // Stage 1 (Robots): 33.33% to 66.66% (10-20 seconds)
  // Stage 2 (System): 66.66% to 100% (20-30 seconds)
  useEffect(() => {
    if (progress <= 33.33) {
      setCurrentStage(0);
    } else if (progress <= 66.66) {
      setCurrentStage(1);
    } else {
      setCurrentStage(2);
    }
  }, [progress]);

  const stage = LOADING_STAGES[currentStage];
  const roundedProgress = Math.round(progress);

  return (
    <div 
      className="loading-screen"
      style={{ backgroundColor: stage.bgColor }}
    >
      {/* Main image with smooth fade */}
      <div className="loading-image-container">
        <img 
          key={currentStage}
          src={stage.image} 
          alt={stage.title}
          className="loading-image"
          style={{ objectFit: stage.objectFit }}
        />
      </div>

      {/* Bottom shadow gradient */}
      <div 
        className="loading-shadow"
        style={{ background: `linear-gradient(to top, ${stage.bgColor} 38%, transparent 100%)` }}
      />

      {/* Bottom UI content */}
      <div className="loading-content">
        {/* Title with fade animation */}
        <h1 key={`title-${currentStage}`} style={{ color: stage.titleColor }}>
          {stage.title}
        </h1>

        {/* Subtitle with fade animation */}
        <p key={`subtitle-${currentStage}`} style={{ color: stage.subtitleColor }}>
          {stage.subtitle}
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

        {/* Stage dots indicator */}
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
