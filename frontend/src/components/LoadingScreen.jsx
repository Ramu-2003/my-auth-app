import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

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
      <div className="loading-image-container">
        <img 
          key={currentStage}
          src={stage.image} 
          alt={stage.title}
          className="loading-image"
        />
      </div>

      <div 
        className="loading-shadow"
        style={{ background: `linear-gradient(to top, ${stage.bgColor} 20%, transparent 100%)` }}
      />

      <div className="loading-content">
        <h1 key={`title-${currentStage}`} style={{ color: stage.titleColor }}>
          {stage.title}
        </h1>

        <p key={`subtitle-${currentStage}`} style={{ color: stage.subtitleColor }}>
          {stage.subtitle}
        </p>

        <div className="loading-progress-row">
          <span style={{ color: stage.subtitleColor }}>Loading</span>
          <span style={{ color: stage.barColor }}>{roundedProgress}%</span>
        </div>

        <div className="loading-bar-track">
          <div 
            className="loading-bar-fill"
            style={{ 
              width: `${progress}%`,
              background: stage.barColor
            }}
          />
        </div>

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
