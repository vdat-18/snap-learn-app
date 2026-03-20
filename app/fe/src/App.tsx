import React, { useState } from 'react';
import RevealCard from './components/ui/RevealCard';
import Onboarding from './components/ui/Onboarding';
import CollectionBook from './components/ui/CollectionBook';
import QuestScreen from './components/ui/QuestScreen';
import ProfileScreen from './components/ui/ProfileScreen';
import LeaderboardScreen from './components/ui/LeaderboardScreen';
import LoginScreen from './components/ui/LoginScreen';
import { useGameStore } from './store/gameStore';
import { Settings, Book, BarChart3, User, Scan, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isQuestOpen, setIsQuestOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Connect to global state
  const { xp, level, streak, userName, addXP, recordCapture, hasSeenOnboarding, setOnboardingSeen } = useGameStore();

  // Handle Splash Screen Timeout
  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

   // Handle Camera Access
   React.useEffect(() => {
     if (!showSplash && userName && hasSeenOnboarding) {
       async function setupCamera() {
         try {
           const stream = await navigator.mediaDevices.getUserMedia({
             video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1920 } },
             audio: false,
           });
           if (videoRef.current) {
             videoRef.current.srcObject = stream;
           }
         } catch (err: any) {
           console.error("Error accessing camera:", err);
           setCameraError(true);
         }
       }
       setupCamera();
     }

     return () => {
       if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
       }
     };
   }, [showSplash, userName, hasSeenOnboarding]);

  const handleCaptureClick = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 image URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      setIsRevealOpen(true);

      // Reward XP as per Section 4.1 in Plan
      addXP(100);
      recordCapture();
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-deepNavy relative overflow-hidden font-outfit select-none">
      {/* 1. SPLASH SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 bg-skyBlue rounded-[40px] flex items-center justify-center shadow-level-3 mb-6"
            >
              <Scan className="w-16 h-16 text-white stroke-[3px]" />
            </motion.div>
            <h1 className="text-4xl font-black text-deepNavy tracking-tight">SnapLearn</h1>
            <p className="text-skyBlue font-bold tracking-[3px] uppercase text-xs mt-2">World Explorer</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LOGIN SCREEN (First time or if logged out) */}
      {!showSplash && !userName && <LoginScreen />}

      {/* 3. ONBOARDING (After login if not seen) */}
      {!showSplash && userName && !hasSeenOnboarding && <Onboarding onFinish={setOnboardingSeen} />}

       {/* 4. MAIN APP CONTENT (Only show when ready) */}
       {(!showSplash && userName && hasSeenOnboarding) && (
         <>
           <CollectionBook isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />
           <QuestScreen isOpen={isQuestOpen} onClose={() => setIsQuestOpen(false)} />
           <ProfileScreen isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
           <LeaderboardScreen isOpen={isRankOpen} onClose={() => setIsRankOpen(false)} />

           {/* Camera Permission Denied Overlay */}
           {cameraError && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6"
             >
               <div className="flex flex-col items-center gap-8 max-w-sm">
                 {/* Mascot Illustration */}
                 <motion.img
                   src="/owl-mascot.png"
                   alt="Mascot"
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: 0.2 }}
                   className="w-32 h-32 object-contain"
                 />

                 {/* Main Message */}
                 <div className="text-center space-y-3">
                   <h2 className="text-4xl font-black text-white mb-4">📸</h2>
                   <p className="text-white font-black text-2xl leading-tight">
                     Cho mình xem thế giới nhé!
                   </p>
                   <p className="text-white/70 font-bold text-sm">
                     SnapLearn cần quyền truy cập camera để tìm kiếm các từ vựng xung quanh bạn.
                   </p>
                 </div>

                 {/* Action Button */}
                 <motion.button
                   whileTap={{ scale: 0.95 }}
                   onClick={() => {
                     setCameraError(false);
                     // Retry camera permission
                     async function retryCamera() {
                       try {
                         const stream = await navigator.mediaDevices.getUserMedia({
                           video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1920 } },
                           audio: false,
                         });
                         if (videoRef.current) {
                           videoRef.current.srcObject = stream;
                         }
                       } catch (err) {
                         console.error("Error accessing camera:", err);
                         setCameraError(true);
                       }
                     }
                     retryCamera();
                   }}
                   className="w-full bg-skyBlue hover:bg-skyBlue/90 text-white font-black text-lg py-4 px-8 rounded-[28px] shadow-level-3 border-t-2 border-white/20 transition-all"
                 >
                   ✨ Cho phép Camera
                 </motion.button>

                 {/* Subtext */}
                 <p className="text-white/50 font-medium text-xs text-center">
                   Bạn có thể thay đổi cài đặt quyền bất kỳ lúc nào trong Cài đặt.
                 </p>
               </div>
             </motion.div>
           )}

           {/* Hidden Canvas for Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* 1. TOP HUD (Head-Up Display) */}
          <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 pt-12 pb-4 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-deepNavy/80 backdrop-blur-xl rounded-full p-1.5 pr-5 border border-white/20 shadow-level-2"
              >
                <div className="w-11 h-11 rounded-full bg-deepNavy border-2 border-sunshineYellow flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(255,210,52,0.3)]">
                  L{level}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-black text-xl tracking-tight">{xp.toLocaleString()}</span>
                  <span className="text-white/60 font-bold text-xs tracking-wider">XP</span>
                  <span className="text-white/30 mx-0.5">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xl">🔥</span>
                    <span className="text-white font-black text-xl">{streak}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <button className="w-13 h-13 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-500 shadow-level-2 border border-white pointer-events-auto transition-transform active:scale-90">
              <Settings className="w-7 h-7" />
            </button>
          </div>

          {/* 2. CAMERA VIEWFINDER & MAIN CONTENT */}
          <main className="flex-1 w-full relative z-0 flex items-center justify-center overflow-hidden bg-black">
            {/* Real-world camera feed */}
            <div className="absolute inset-0 z-0">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Overlays for better visibility */}
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]"></div>
              {/* Vignette effect */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.5)_100%)]"></div>
            </div>

            {/* Mission Overlay */}
            <div className="absolute top-32 left-6 z-40 max-w-[220px]">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white/40 backdrop-blur-2xl p-4 rounded-[32px] border border-white/50 shadow-level-3"
              >
                <p className="text-white/60 font-black text-[10px] uppercase tracking-widest mb-1">Hi, {userName || 'Small Explorer'}! 👋</p>
                <p className="text-white font-black text-base mb-2 drop-shadow-md tracking-tight leading-tight">Tìm 3 vật màu đỏ 🔴</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3.5 bg-white/40 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-skyBlue w-1/3 rounded-full shadow-[0_0_12px_rgba(77,168,255,0.9)] animate-pulse"></div>
                  </div>
                  <span className="text-white font-black text-xs">1/3</span>
                </div>
              </motion.div>
            </div>

            {/* Dashed Scanning Box (Central focus) */}
            <div className="relative group z-10">
              <div className="w-72 h-72 md:w-80 md:h-80 border-[4px] border-dashed border-sunshineYellow rounded-[56px] flex items-center justify-center animate-pulse duration-[2000ms]">
                <div className="absolute inset-0 bg-sunshineYellow/5 rounded-[56px]"></div>

                {/* Target Identification Tooltip */}
                <div className="absolute -bottom-16 z-30 transform -translate-y-2">
                  <div className="bg-white/30 backdrop-blur-xl px-8 py-3 rounded-2xl border border-white/40 shadow-level-3 text-center min-w-[180px]">
                    <span className="block text-[10px] font-black text-white/80 uppercase tracking-[3px] mb-1">Target Identified</span>
                    <span className="text-sunshineYellow font-black text-xl tracking-[1px] uppercase drop-shadow-md">Cat</span>
                  </div>
                </div>

                {/* L-Shaped Corners */}
                <div className="absolute -top-12 -right-12 w-20 h-20 border-t-[10px] border-r-[10px] border-white/60 rounded-tr-[40px]"></div>
                <div className="absolute -bottom-12 -left-12 w-20 h-20 border-b-[10px] border-l-[10px] border-white/60 rounded-bl-[40px]"></div>

                {/* Central Scan Button */}
                <motion.button
                  whileTap={{ y: 6 }}
                  className="w-24 h-24 rounded-3xl bg-sunshineYellow shadow-[0_10px_0_rgb(161,98,7)] flex items-center justify-center border-t-2 border-white/30"
                >
                  <Scan className="w-12 h-12 text-deepNavy stroke-[3px]" />
                </motion.button>
              </div>
            </div>

            {/* Floating XP Particles (Visual effect) */}
            <div className="absolute bottom-60 right-10">
              <div className="text-sunshineYellow font-black text-2xl animate-bounce drop-shadow-lg">✨</div>
            </div>

            {/* Primary Capture Button Area */}
            <div className="absolute bottom-40 flex flex-col items-center z-20">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleCaptureClick}
                className="relative flex items-center justify-center p-3 rounded-full bg-black/20 backdrop-blur-md"
              >
                <div className="w-24 h-24 rounded-full border-[8px] border-white bg-transparent flex items-center justify-center shadow-level-3">
                  <div className="w-16 h-16 bg-coralRed rounded-full shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] border-2 border-white/20"></div>
                </div>
              </motion.button>
            </div>
          </main>


          {/* 4. BOTTOM NAVIGATION */}
          <nav className="fixed bottom-8 left-6 right-6 z-50">
            <div className="bg-white/70 backdrop-blur-3xl h-24 rounded-[48px] border border-white/40 shadow-level-3 flex items-center justify-around px-8">
              {/* Active Tab: BOOK */}
              <motion.button
                whileHover={{ y: -5 }}
                onClick={() => setIsBookOpen(true)}
                className="flex flex-col items-center justify-center gap-1.5 -translate-y-10 pointer-events-auto"
              >
                <div className="w-20 h-20 bg-sunshineYellow rounded-[28px] shadow-[0_10px_0_rgb(161,98,7)] flex items-center justify-center border-t-2 border-white/40">
                  <Book className="w-10 h-10 text-deepNavy fill-deepNavy/20" />
                </div>
                <span className="text-[12px] font-black text-sunshineYellow uppercase tracking-[2px] drop-shadow-sm">Book</span>
              </motion.button>

              <NavItem
                icon={<Target className="w-9 h-9" />}
                label="Quest"
                onClick={() => setIsQuestOpen(true)}
              />
              <NavItem
                icon={<BarChart3 className="w-9 h-9" />}
                label="Rank"
                onClick={() => setIsRankOpen(true)}
              />
              <NavItem
                icon={<User className="w-9 h-9" />}
                label="Me"
                onClick={() => setIsProfileOpen(true)}
              />
            </div>
          </nav>

          <RevealCard
            isOpen={isRevealOpen}
            onClose={() => setIsRevealOpen(false)}
            word_vi="Con mèo"
            word_en="Cat"
            word_zh="猫"
            pinyin="māo"
            phonetic_en="/kæt/"
            rarity="Legendary"
            category="Animals"
            imageUrl={capturedImage || ""}
          />
        </>
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-1 group active:scale-90 transition-all"
  >
    <div className="text-slate-400 group-hover:text-skyBlue group-hover:scale-110 transition-all duration-300 transform">
      {icon}
    </div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] group-hover:text-skyBlue transition-colors">
      {label}
    </span>
  </button>
);

export default App;

