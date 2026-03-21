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
import XPFlyManager from './components/ui/XPFlyManager';
import { useGameStore } from './store/gameStore';
import { useSoundEffects } from './hooks/useSoundEffects';
import { triggerHaptic, mascotSpeak } from './utils/feedbackUtils';
import { MOCK_AI_RESPONSES } from './store/mockData';
import { Scan, WifiOff, RefreshCw, Image } from 'lucide-react';
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
  const [isCategoryViewOpen, setIsCategoryViewOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    streak,
  } = useGameStore();

  const { playPop, playShutter, playChime } = useSoundEffects();

  // Initialization
  useEffect(() => {
    // Initial check for daily usage
    checkAndResetDailyUsage();
  }, [checkAndResetDailyUsage]);

  // Screen Voice Guidance Narration - Shortened
  useEffect(() => {
    if (!userName || !hasSeenOnboarding || showSplash) return;

    const timer = setTimeout(() => {
      if (isBookOpen) {
        mascotSpeak("Kho báu của bạn ở đây nè!", 'vi-VN', true);
      } else if (isQuestOpen) {
        mascotSpeak("Nhiệm vụ nhận quà xịn nha!", 'vi-VN', true);
      } else if (isRankOpen) {
        mascotSpeak("Ai đang đứng đầu bảng thế nhỉ?", 'vi-VN', true);
      } else if (isProfileOpen) {
        mascotSpeak("Góc bí mật của riêng bạn đó!", 'vi-VN', true);
      } else {
        // Camera / Main Screen
        mascotSpeak("Tìm từ mới bằng camera ngay nha!", 'vi-VN', true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [userName, hasSeenOnboarding, showSplash, isBookOpen, isQuestOpen, isRankOpen, isProfileOpen]);

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
      setCameraError('Bạn ơi, hãy cho phép app dùng Camera để bắt học từ mới nhé!');
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

  const processImage = (imageData: string) => {
    setCapturedImage(imageData);

    // Start "AI Processing" mock
    setIsAIProcessing(true);

    // Reset previous result before processing new one to ensure UI updates
    setCapturedResult(null);

    setTimeout(() => {
      const validResponses = MOCK_AI_RESPONSES.filter((r: any) => r.response.object_en);
      const randomResp = validResponses[Math.floor(Math.random() * validResponses.length)];

      const resp = randomResp.response as any;
      const result = {
        word_en: resp.object_en as string,
        word_vi: resp.object_vi as string,
        word_zh: resp.object_zh as string,
        rarity: (resp.rarity === 'legendary' ? 'Legendary' :
          resp.rarity === 'epic' ? 'Epic' :
            resp.rarity === 'rare' ? 'Rare' :
              resp.rarity === 'uncommon' ? 'Uncommon' : 'Common') as any,
        category: resp.category === 'animals' ? 'Animals' :
          randomResp.response.category === 'food' ? 'Food' :
            randomResp.response.category === 'nature' ? 'Nature' :
              randomResp.response.category === 'vehicles' ? 'Vehicles' :
                randomResp.response.category === 'school' ? 'School' : 'Home'
      };

      // Set new result
      setCapturedResult(result);
      setIsAIProcessing(false);

      // Delay opening the reveal card slightly to allow state to settle
      setTimeout(() => {
        setIsRevealOpen(true);
        if (result.rarity === 'Legendary') {
          playChime();
        }
        addXP(10);
        recordCapture(result.rarity);
      }, 100);

    }, 2500);
  };

  const handleCaptureClick = async () => {
    if (isTimeLimitExceeded()) {
      setShowTimeLimitError(true);
      return;
    }

    if (!videoRef.current || !canvasRef.current) return;

    playShutter();
    triggerHaptic(50);

    // Trigger Flash Effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg');
      processImage(imageData);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex flex-col items-center justify-center p-8 text-white overflow-hidden">
        {/* Background Decorative Emojis */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {['⭐', '✨', '🍎', '🐶', '📚'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-5xl"
              initial={{ y: '110vh', x: `${15 + i * 20}%` }}
              animate={{ y: '-10vh' }}
              transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'linear', delay: i * 2 }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{
            rotate: [0, 3, -3, 0],
            y: [0, -10, 0]
          }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="w-64 h-64 mb-10 relative z-10 flex items-center justify-center rounded-full overflow-hidden"
        >
          {/* Breathing Animation Wrapper */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <img
              src="/owl-mascot.png"
              alt="SnapLearn Mascot"
              className="w-full h-full object-contain scale-110"
            />
          </motion.div>
        </motion.div>

        <div className="relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl font-black italic tracking-tighter mb-8 drop-shadow-xl">
            SnapLearn
            <div className="h-1.5 w-12 bg-sunshineYellow rounded-full mt-1 mx-auto" />
          </h1>

          {/* Interaction Button to Unlock Audio (Browser policy) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playPop();
              mascotSpeak("Chào mừng bạn yêu... đến với thế giới Snap Learn! Chúng mình... cùng bắt đầu... hành trình khám phá nhé!", 'vi-VN');
              setShowSplash(false);
            }}
            className="bg-sunshineYellow text-deepNavy px-8 py-4 rounded-[28px] font-black text-lg shadow-[0_6px_0_rgb(161,98,7)] flex items-center gap-3 active:shadow-none active:translate-y-[6px] transition-all border-t-2 border-white/40"
          >
            BẮT ĐẦU NGAY 🚀
          </motion.button>
          <p className="mt-6 text-white/40 font-black uppercase tracking-[3px] text-[10px]">Chạm để đánh thức Cú thông thái</p>
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
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">

      <AnimatePresence>
        {/* Flash Overlay */}
        {isFlashing && (
          <div className="fixed inset-0 z-[100] bg-white pointer-events-none animate-out fade-out duration-150" />
        )}

        {/* 1. TOP HUD (Head-Up Display) */}
        <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 pt-12 pb-4 pointer-events-none">
          <div className="flex-1 flex flex-col pointer-events-auto">
            {/* Profile - Visual only */}
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-level-2 border-t-2 border-slate-100">
                {userAvatar}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 bg-skyBlue/90 backdrop-blur px-2 py-0.5 rounded-full w-fit mb-0.5 shadow-sm">
                  <span className="text-[12px]">⭐</span>
                  <span className="text-[10px] font-black text-white leading-none uppercase">Cấp {level}</span>
                </div>
                <span className="text-xs font-black text-white drop-shadow-md leading-none">{userName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Streak - Fire Animation */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                filter: ["drop-shadow(0 0 2px rgba(239,68,68,0.2))", "drop-shadow(0 0 8px rgba(239,68,68,0.6))", "drop-shadow(0 0 2px rgba(239,68,68,0.2))"]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-lg pl-1.5 pr-3 py-1.5 rounded-full border border-white/20 shadow-xl"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_3px_0_rgb(154,52,18)] border-t border-white/30">
                <span className="text-sm">🔥</span>
              </div>
              <span className="text-sm font-black text-white leading-none">{streak}</span>
            </motion.div>

            <button
              onClick={() => {
                setIsBookOpen(true);
                playPop();
              }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-50 flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.1),0_8px_15px_rgba(0,0,0,0.1)] border border-slate-200 transition-all active:translate-y-0.5 active:shadow-none"
            >
              <motion.img
                layoutId="book-icon"
                src="/icon-book.png"
                alt="Book"
                className="w-10 h-10 object-contain rounded-xl"
              />
            </button>

            <button
              onClick={() => playPop()}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-50 flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.1),0_8px_15px_rgba(0,0,0,0.1)] border border-slate-200 transition-all active:translate-y-0.5 active:shadow-none"
            >
              <img src="/icon-settings.png" alt="Settings" className="w-10 h-10 object-contain rounded-xl" />
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
                  CHƠI LẠI NÈ
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

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
            {/* 1. HIỆU ỨNG MẶT NẠ */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="vignette-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect x="50%" y="50%" width="320" height="320" rx="44" fill="black" transform="translate(-160, -200)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.6)" mask="url(#vignette-mask)" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[320px] h-[320px] rounded-[44px] relative -translate-y-[40px]">
                <div className="absolute inset-0 backdrop-brightness-110 backdrop-saturate-150 rounded-[44px] border-2 border-white/10" />
              </div>
            </div>

            {/* 2. KHUNG BAO SỐNG & FLOATING CORNERS */}
            <div className="absolute w-[320px] h-[320px] -translate-y-[40px] pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 border-[1.5px] border-white/30 rounded-[44px]"
              />

              {/* Center Reticle */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <Scan className="w-10 h-10 text-sunshineYellow" />
              </div>

              {/* 4 CORNERS */}
              <motion.div animate={{ x: [-3, 3, -3], y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-3 -left-3 w-14 h-14 border-t-[7px] border-l-[7px] border-sunshineYellow rounded-tl-3xl shadow-[0_0_15px_rgba(255,210,52,0.5)]" />
              <motion.div animate={{ x: [3, -3, 3], y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3.2 }} className="absolute -top-3 -right-3 w-14 h-14 border-t-[7px] border-r-[7px] border-sunshineYellow rounded-tr-3xl shadow-[0_0_15px_rgba(255,210,52,0.5)]" />
              <motion.div animate={{ x: [-3, 3, -3], y: [3, -3, 3] }} transition={{ repeat: Infinity, duration: 2.8 }} className="absolute -bottom-3 -left-3 w-14 h-14 border-b-[7px] border-l-[7px] border-sunshineYellow rounded-bl-3xl shadow-[0_0_15px_rgba(255,210,52,0.5)]" />
              <motion.div animate={{ x: [3, -3, 3], y: [3, -3, 3] }} transition={{ repeat: Infinity, duration: 3.1 }} className="absolute -bottom-3 -right-3 w-14 h-14 border-b-[7px] border-r-[7px] border-sunshineYellow rounded-br-3xl shadow-[0_0_15px_rgba(255,210,52,0.5)]" />

            </div>
          </div>
        </main>

        {/* 3. CAPTURE / ACTION CONTROLS (Moved down to bottom-12) */}
        <div className="fixed bottom-12 left-0 w-full z-50 px-8 flex items-center justify-between pointer-events-none">
          <div className="flex-1 flex justify-center items-center gap-12">
            <motion.button
              whileTap={{ scale: 0.8, rotate: 180 }}
              onClick={() => {
                triggerHaptic(30);
                playPop();
                setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
              }}
              className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto shadow-lg"
            >
              <RefreshCw className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleCaptureClick}
              disabled={isAIProcessing}
              className="relative w-24 h-24 pointer-events-auto"
            >
              <div className="absolute inset-0 bg-white rounded-full shadow-2xl scale-110" />
              <div className="absolute inset-1.5 border-[6px] border-black rounded-full" />
              <div className="absolute inset-3.5 bg-black rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full" />
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                triggerHaptic(30);
                playPop();
                fileInputRef.current?.click();
              }}
              className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto shadow-lg"
            >
              <Image className="w-6 h-6" />
            </motion.button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Mobile Nav Bar - ONLY visible on sub-pages (Book, Quest, Rank, Me) */}
        {!showSplash && hasSeenOnboarding && userName && (isBookOpen || isQuestOpen || isRankOpen || isProfileOpen) && !isCategoryViewOpen && (
          <nav className="fixed bottom-0 left-0 right-0 p-4 pb-8 flex justify-center z-[200] pointer-events-none">
            {/* Background Blur Gradient for better separation */}
            <div className="absolute inset-0 bg-gradient-to-t from-snowWhite via-snowWhite/80 to-transparent pointer-events-none h-40 bottom-0" />

            <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_15px_35px_rgba(0,0,0,0.15)] border-2 border-white/60 px-2 py-3 flex items-center justify-around pointer-events-auto w-[92%] max-w-md mx-auto relative ring-1 ring-black/5">
              <NavItem
                image="/icon-book.png"
                label="Kho báu"
                bounce={bookBounce}
                onClick={() => {
                  // Global Switch: Open Book, Close Others
                  setIsBookOpen(true);
                  setIsQuestOpen(false);
                  setIsRankOpen(false);
                  setIsProfileOpen(false);
                  setIsRevealOpen(false);
                  playPop();
                  setBookBounce(false);
                }}
              />
              <NavItem
                image="/icon-quest.png"
                label="Vượt khó"
                onClick={() => {
                  // Global Switch: Open Quest, Close Others
                  setIsQuestOpen(true);
                  setIsBookOpen(false);
                  setIsRankOpen(false);
                  setIsProfileOpen(false);
                  setIsRevealOpen(false);
                  playPop();
                }}
              />
              {/* Center Snap Button (Uniform Size) */}
              <NavItem
                image="/icon-camera.png"
                label="Bắt lấy"
                onClick={() => {
                  const isSomethingOpen = isBookOpen || isQuestOpen || isRankOpen || isProfileOpen || isRevealOpen;

                  if (isSomethingOpen) {
                    // Global Switch: Back to Camera
                    setIsBookOpen(false);
                    setIsQuestOpen(false);
                    setIsRankOpen(false);
                    setIsProfileOpen(false);
                    setIsRevealOpen(false);
                    playPop();
                    mascotSpeak("Nơi này có nhiều bí mật lắm đó! Bạn hãy dùng máy ảnh tìm xem những người bạn từ vựng đang trốn ở đâu nhé!", 'vi-VN');
                  } else {
                    // Action: Capture!
                    handleCaptureClick();
                  }
                }}
              />
              <NavItem
                image="/icon-rank.png"
                label="Siêu nhân"
                onClick={() => {
                  // Global Switch: Open Rank, Close Others
                  setIsRankOpen(true);
                  setIsBookOpen(false);
                  setIsQuestOpen(false);
                  setIsProfileOpen(false);
                  setIsRevealOpen(false);
                  playPop();
                }}
              />
              <NavItem
                image="/icon-me.png"
                label="Của tôi"
                onClick={() => {
                  // Global Switch: Open Profile, Close Others
                  setIsProfileOpen(true);
                  setIsBookOpen(false);
                  setIsQuestOpen(false);
                  setIsRankOpen(false);
                  setIsRevealOpen(false);
                  playPop();
                }}
              />
            </div>
          </nav>
        )}
      </AnimatePresence>

      <CollectionBook
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        onCategorySelectChange={(isSelected) => setIsCategoryViewOpen(isSelected)}
      />
      <QuestScreen isOpen={isQuestOpen} onClose={() => setIsQuestOpen(false)} />
      <ProfileScreen isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <LeaderboardScreen isOpen={isRankOpen} onClose={() => setIsRankOpen(false)} />

      {
        capturedResult && (
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
            onCardFlyToCollection={() => {
              setIsBookOpen(true);
              playPop();
            }}
          />
        )
      }

      <LevelUpCelebration />
      <ErrorOverlay
        type="time-limit"
        isVisible={showTimeLimitError}
        onClose={() => setShowTimeLimitError(false)}
      />

      <AIProcessingLoading isVisible={isAIProcessing} />

      {/* Global Animation Layers */}
      <XPFlyManager targetX={60} targetY={60} />

      {
        devMode && (
          <button
            onClick={() => setDevMode(false)}
            className="fixed top-24 right-4 z-[100] bg-red-500 text-white p-2 rounded text-xs"
          >
            DEV MODE
          </button>
        )
      }
    </div >
  );
};

const NavItem: React.FC<{ image: string; label: string; bounce?: boolean; onClick?: () => void }> = ({ image, label, bounce, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    animate={bounce ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-1.5 pointer-events-auto min-w-[64px]"
  >
    <div className="w-12 h-12 bg-sunshineYellow rounded-[14px] shadow-[0_4px_0_rgb(161,98,7)] flex items-center justify-center border-t-2 border-white/40 overflow-hidden">
      <img src={image} alt={label} className="w-8 h-8 object-contain mix-blend-multiply" />
    </div>
    <span className="text-[9px] font-black text-sunshineYellow uppercase tracking-[1px] drop-shadow-sm">
      {label}
    </span>
  </motion.button>
);

export default App;
