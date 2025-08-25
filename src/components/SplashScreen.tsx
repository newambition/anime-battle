import { useEffect, useMemo, useState } from 'react';
import MenuImage from '../assets/MenuImage.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Memoize particles to prevent re-calculation on re-renders
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 2 + 1; // 1px to 3px
      const duration = Math.random() * 5 + 3; // 3s to 8s
      const delay = Math.random() * 5;
      const left = Math.random() * 100;
      const top = Math.random() * 100;

      return (
        <div
          key={i}
          className="absolute animate-pulse rounded-full bg-violet-700/90 will-change-transform"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            height: `${size}px`,
            width: `${size}px`,
            animationName: 'twinkle',
            animationTimingFunction: 'ease-in-out',
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      );
    });
  }, []);

  useEffect(() => {
    // Optimized loading progress - less frequent updates
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 15; // Consistent loading speed
      });
    }, 400); // Less frequent updates

    // Stagger the animations
    const contentTimer = setTimeout(() => setShowContent(true), 300);
    const tapTimer = setTimeout(() => setShowTapToContinue(true), 2500);
    const autoProgressTimer = setTimeout(() => handleContinue(), 4000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(contentTimer);
      clearTimeout(tapTimer);
      clearTimeout(autoProgressTimer);
    };
  }, []);

  const handleContinue = () => {
    setIsExiting(true);
    setTimeout(() => onComplete(), 800);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 will-change-transform ${
        isExiting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      }`}
      onClick={showTapToContinue ? handleContinue : undefined}
      style={{ cursor: showTapToContinue ? 'pointer' : 'default' }}
    >
      {/* Use app-wide gradient */}
      <div className="bg-gradient absolute inset-0" />

      {/* Shimmering particles */}
      <div className="absolute inset-0 overflow-hidden">{particles}</div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Menu Image */}
        <div
          className={`mb-8 transform transition-all duration-700 will-change-transform ${
            showContent
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-4 scale-95 opacity-0'
          }`}
        >
          <img src={MenuImage} alt="Anime Showdown" className="h-32 w-46" />
        </div>

        {/* Title */}
        <div
          className={`mb-4 transform transition-all delay-200 duration-700 will-change-transform ${
            showContent
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-4 scale-95 opacity-0'
          }`}
        >
          <h1 className="font-pixel text-center text-4xl leading-tight font-bold text-white">
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              ANIME
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              SHOWDOWN
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className={`mb-8 transform transition-all delay-300 duration-700 will-change-transform ${
            showContent
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-4 scale-95 opacity-0'
          }`}
        >
          <p className="font-pixel text-center text-sm text-violet-600">
            Turn-Based Battle Arena
          </p>
        </div>

        {/* Battle icons animation */}
        <div
          className={`mb-8 transform transition-all delay-400 duration-700 will-change-transform ${
            showContent
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-8 scale-75 opacity-0'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="text-3xl">💥</div>
            <div className="text-3xl">⚔️</div>
            <div className="text-3xl">💥</div>
          </div>
        </div>

        {/* Loading bar */}
        <div
          className={`mb-8 w-64 transform transition-all delay-500 duration-700 will-change-transform ${
            showContent
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-4 scale-95 opacity-0'
          }`}
        >
          <div className="mb-2 text-center">
            <p className="font-pixel text-xs text-violet-600">
              Loading... {Math.floor(loadingProgress)}%
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Tap to continue */}
        {showTapToContinue && (
          <div className="animate-pulse">
            <p className="font-pixel text-center text-xs text-yellow-300">
              TAP TO CONTINUE
            </p>
            <div className="mt-2 flex justify-center">
              <div className="h-3 w-3 animate-ping rounded-full bg-yellow-300" />
            </div>
          </div>
        )}
      </div>

      {/* Version info */}
      <div className="absolute right-4 bottom-4">
        <p className="font-pixel text-xs text-black/50">v1.0.0</p>
      </div>
    </div>
  );
};

export default SplashScreen;
