import React, { useState, useEffect, useRef, useCallback } from 'react';
import RevealCard from './components/ui/RevealCard';
import Onboarding from './components/ui/Onboarding';
import CollectionBook from './components/ui/CollectionBook';
import QuestScreen from './components/ui/QuestScreen';
import ProfileScreen from './components/ui/ProfileScreen';
import LeaderboardScreen from './components/ui/LeaderboardScreen';
import LoginScreen from './components/ui/LoginScreen';
import LevelUpCelebration from './components/ui/LevelUpCelebration';
import ErrorOverlay from './components/ui/ErrorOverlay';
import AIProcessingLoading from './components/ui/AIProcessingLoading';
import { useGameStore } from './store/gameStore';
import { useSoundEffects } from './hooks/useSoundEffects';
import { triggerHaptic } from './utils/feedbackUtils';
import { Scan, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  // UI States
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedResult, setCapturedResult] = useState<{
    word_en: string;
    word_vi: string;
    word_zh: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    category: string;
  } | null>(null);

  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isQuestOpen, setIsQuestOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showTimeLimitError, setShowTimeLimitError] = useState(false);
  const [bookBounce, setBookBounce] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Connect to global state
  const {
    userName,
    userAvatar,
    level,
    addXP,
    recordCapture,
    hasSeenOnboarding,
    setOnboardingSeen,
    isTimeLimitExceeded,
    checkAndResetDailyUsage,
    incrementUsageSeconds,
  } = useGameStore();

  const { playPop, playShutter, playChime } = useSoundEffects();

  // Initialization
  useEffect(() => {
    // Handle splash
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Initial check for daily usage
    checkAndResetDailyUsage();

    return () => clearTimeout(timer);
  }, [checkAndResetDailyUsage]);

  // Usage timer
  useEffect(() => {
    const usageInterval = setInterval(() => {
      if (!showSplash && userName && hasSeenOnboarding) {
        incrementUsageSeconds();
        // Periodically check if limit exceeded
        if (isTimeLimitExceeded()) {
          setShowTimeLimitError(true);
        }
      }
    }, 1000);
    return () => clearInterval(usageInterval);
  }, [showSplash, userName, hasSeenOnboarding, incrementUsageSeconds, isTimeLimitExceeded]);

  // Camera Setup
  const setupCamera = useCallback(async (mode: 'user' | 'environment') => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setCameraError(null);
    } catch (err) {
      console.error('Camera Error:', err);
      setCameraError('Bé ơi, hãy cho phép app dùng Camera để bắt học từ mới nhé!');
    }
  }, []);

  useEffect(() => {
    if (!showSplash && userName && hasSeenOnboarding) {
      setupCamera(facingMode);
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showSplash, userName, hasSeenOnboarding, setupCamera, facingMode]);

  const handleCaptureClick = async () => {
    if (isTimeLimitExceeded()) {
      setShowTimeLimitError(true);
      return;
    }

    if (!videoRef.current || !canvasRef.current) return;

    playShutter();
    triggerHaptic(50);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);

      // Start "AI Processing" mock
      setIsAIProcessing(true);

      setTimeout(() => {
        const mockResults = [
          { word_en: 'Cat', word_vi: 'Con mèo', word_zh: '猫', rarity: 'Common', category: 'Animals' },
          { word_en: 'Dog', word_vi: 'Con chó', word_zh: '狗', rarity: 'Uncommon', category: 'Animals' },
          { word_en: 'Apple', word_vi: 'Quả táo', word_zh: '苹果', rarity: 'Rare', category: 'Food' },
          { word_en: 'Starry Night', word_vi: 'Đêm đầy sao', word_zh: '星月夜', rarity: 'Legendary', category: 'Nature' },
        ];

        const result = mockResults[Math.floor(Math.random() * mockResults.length)] as any;

        setIsAIProcessing(false);
        setCapturedResult(result);
        setIsRevealOpen(true);

        if (result.rarity === 'Legendary') {
          playChime();
        }

        addXP(10);
        recordCapture(result.rarity);
      }, 2500);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-sky-400 flex flex-col items-center justify-center p-8 text-white">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-32 h-32 mb-8"
        >
          <img src="/owl-mascot.png" alt="SnapLearn Mascot" className="w-full h-full object-contain" />
        </motion.div>
        <h1 className="text-4xl font-black italic tracking-tighter mb-2">SnapLearn</h1>
        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2 }}
            className="h-full bg-sunshineYellow"
          />
        </div>
      </div>
    );
  }

  if (!userName) {
    return <LoginScreen />;
  }

  if (!hasSeenOnboarding) {
    return <Onboarding onFinish={() => setOnboardingSeen()} />;
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-outfit select-none">

      <AnimatePresence>
        {/* 1. TOP HUD (Head-Up Display) */}
        <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 pt-12 pb-4 pointer-events-none">
          <div className="flex-1 flex flex-col pointer-events-auto">
            {/* Profile - Visual only */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-level-2 border-t-2 border-slate-100">
                {userAvatar}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 bg-skyBlue/90 backdrop-blur px-2 py-0.5 rounded-full w-fit mb-1 shadow-sm">
                  <span className="text-[14px]">⭐</span>
                  <span className="text-[12px] font-black text-white leading-none">{level}</span>
                </div>
                <span className="text-xl font-black text-white drop-shadow-md leading-none">{userName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Stats - Visual only */}
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg pl-2 pr-4 py-2 rounded-[24px] border border-white/20 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-sunshineYellow flex items-center justify-center shadow-[0_4px_0_rgb(161,98,7)] border-t-2 border-white/40">
                <span className="text-xl">⚡</span>
              </div>
              <span className="text-xl font-black text-white leading-none">85</span>
            </div>

            <button
              onClick={() => playPop()}
              className="w-13 h-13 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-level-2 border border-white pointer-events-auto transition-transform active:scale-90"
            >
              <img src="/icon-settings.png" alt="Settings" className="w-9 h-9 object-contain mix-blend-multiply" />
            </button>
          </div>
        </div>

        {/* 2. CAMERA VIEWFINDER & MAIN CONTENT */}
        <main className="relative w-full h-full pt-20">
          <div className="absolute inset-0 z-0">
            {cameraError ? (
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <WifiOff className="w-10 h-10 text-white/40" />
                </div>
                <p className="text-white font-bold">{cameraError}</p>
                <button
                  onClick={() => setupCamera(facingMode)}
                  className="mt-6 bg-skyBlue px-6 py-3 rounded-xl font-black text-white"
                >
                  THỬ LẠI
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-64 h-64 border-[3px] border-white/40 rounded-[48px] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] relative -translate-y-8"
            >
              <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-sunshineYellow rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-sunshineYellow rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-sunshineYellow rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-sunshineYellow rounded-br-2xl" />

              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                <Scan className="w-10 h-10 text-white opacity-40 animate-pulse" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[4px]">Scanning...</span>
              </div>
            </motion.div>
          </div>
        </main>

        {/* 3. CAPTURE / ACTION CONTROLS */}
        <div className="fixed bottom-36 left-0 w-full z-50 px-8 flex items-center justify-between pointer-events-none">
          <div className="flex-1 flex justify-center items-center gap-8 translate-x-12">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleCaptureClick}
              disabled={isAIProcessing}
              className="relative w-24 h-24 pointer-events-auto"
            >
              <div className="absolute inset-0 bg-white rounded-full shadow-2xl scale-110" />
              <div className="absolute inset-1.5 border-[6px] border-black rounded-full" />
              <div className="absolute inset-3.5 bg-black rounded-full flex items-center justify-center">
                <div className="w-14 h-14 bg-white/20 rounded-full" />
              </div>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8, rotate: 180 }}
              onClick={() => {
                triggerHaptic(30);
                playPop();
                setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
              }}
              className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto"
            >
              <RefreshCw className="w-7 h-7" />
            </motion.button>
          </div>
        </div>

        <nav className="fixed bottom-8 left-6 right-6 z-50">
          <div className="bg-white/70 backdrop-blur-3xl h-24 rounded-[48px] border border-white/40 shadow-level-3 flex items-center justify-around px-4 text-deepNavy">
            <NavItem
              image="/icon-book.png"
              label="Book"
              bounce={bookBounce}
              onClick={() => {
                setIsBookOpen(true);
                playPop();
                setBookBounce(false);
              }}
            />
            <NavItem
              image="/icon-quest.png"
              label="Quest"
              onClick={() => {
                setIsQuestOpen(true);
                playPop();
              }}
            />
            <NavItem
              image="/icon-rank.png"
              label="Rank"
              onClick={() => {
                setIsRankOpen(true);
                playPop();
              }}
            />
            <NavItem
              image="/icon-me.png"
              label="Me"
              onClick={() => {
                setIsProfileOpen(true);
                playPop();
              }}
            />
          </div>
        </nav>
      </AnimatePresence>

      <CollectionBook isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />
      <QuestScreen isOpen={isQuestOpen} onClose={() => setIsQuestOpen(false)} />
      <ProfileScreen isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <LeaderboardScreen isOpen={isRankOpen} onClose={() => setIsRankOpen(false)} />

      {capturedResult && (
        <RevealCard
          isOpen={isRevealOpen}
          onClose={() => setIsRevealOpen(false)}
          word_vi={capturedResult.word_vi}
          word_en={capturedResult.word_en}
          word_zh={capturedResult.word_zh}
          rarity={capturedResult.rarity}
          imageUrl={capturedImage || ''}
          category={capturedResult.category}
          pinyin=""
          phonetic_en=""
        />
      )}

      <LevelUpCelebration />
      <ErrorOverlay
        type="time-limit"
        isVisible={showTimeLimitError}
        onClose={() => setShowTimeLimitError(false)}
      />

      <AIProcessingLoading isVisible={isAIProcessing} />

      {devMode && (
        <button
          onClick={() => setDevMode(false)}
          className="fixed top-24 right-4 z-[100] bg-red-500 text-white p-2 rounded text-xs"
        >
          DEV MODE
        </button>
      )}
    </div>
  );
};

const NavItem: React.FC<{ image: string; label: string; bounce?: boolean; onClick?: () => void }> = ({ image, label, bounce, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    animate={bounce ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-1.5 pointer-events-auto"
  >
    <div className="w-14 h-14 bg-sunshineYellow rounded-[18px] shadow-[0_5px_0_rgb(161,98,7)] flex items-center justify-center border-t-2 border-white/40 overflow-hidden">
      <img src={image} alt={label} className="w-10 h-10 object-contain mix-blend-multiply" />
    </div>
    <span className="text-[10px] font-black text-sunshineYellow uppercase tracking-[2px] drop-shadow-sm">
      {label}
    </span>
  </motion.button>
);

export default App;
