import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { PartyPopper as Party, Sparkles, ArrowRight } from 'lucide-react';

const avatars = ['🦊', '🦁', '🐼', '🐰', '🐯', '🐨', '🐷', '🦄', '🐝', '🐧'];

const LoginScreen: React.FC = () => {
    const { setUserName } = useGameStore();
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
    const [isJoining, setIsJoining] = useState(false);

    // If user already logged in (persistence from store), this component won't show in App.tsx
    // But we implement the entry logic here.

    const handleJoinClick = () => {
        if (!name.trim()) return;
        setIsJoining(true);
        // Simulate loading
        setTimeout(() => {
            setUserName(name);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[300] bg-softCream flex items-center justify-center p-6 font-outfit overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] bg-skyBlue/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-sunshineYellow/5 rounded-full blur-3xl" />

            <div className="w-full max-w-sm relative flex flex-col items-center">
                {/* Mascot Illustration Placeholder */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                    className="w-48 h-48 bg-white rounded-full shadow-level-3 flex items-center justify-center text-8xl mb-10 border-8 border-white group"
                >
                    <span className="group-hover:scale-110 transition-transform">{selectedAvatar}</span>
                    <div className="absolute -top-2 -right-2 bg-sunshineYellow w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                        <Sparkles className="w-6 h-6 text-deepNavy" />
                    </div>
                </motion.div>

                {/* Greeting */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-deepNavy mb-3 tracking-tight">Chào mừng bé!</h1>
                    <p className="text-slate-500 font-bold leading-relaxed px-4">
                        Tên gọi ở nhà của bé là gì? Hãy chọn một linh vật nhé! 🌟
                    </p>
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-5 gap-3 mb-10 w-full px-2">
                    {avatars.map((a) => (
                        <motion.button
                            key={a}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedAvatar(a)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${selectedAvatar === a ? 'bg-skyBlue text-white shadow-md ring-4 ring-skyBlue/20 scale-110' : 'bg-white text-slate-400 hover:bg-slate-50'
                                }`}
                        >
                            {a}
                        </motion.button>
                    ))}
                </div>

                {/* Login Fields */}
                <div className="w-full space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tên đăng nhập..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-16 bg-white rounded-2xl px-6 text-lg font-bold text-deepNavy placeholder:text-slate-300 shadow-sm border-2 border-transparent focus:border-skyBlue focus:outline-none transition-all"
                        />
                        <Party className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                    </div>

                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Mật khẩu..."
                            className="w-full h-16 bg-white rounded-2xl px-6 text-lg font-bold text-deepNavy placeholder:text-slate-300 shadow-sm border-2 border-transparent focus:border-skyBlue focus:outline-none transition-all"
                        />
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleJoinClick}
                        disabled={!name.trim() || isJoining}
                        className="w-full bg-skyBlue text-white h-16 rounded-[24px] font-black text-xl shadow-[0_8px_0_rgba(59,130,246,0.3)] active:shadow-none active:translate-y-[8px] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3 mt-6"
                    >
                        {isJoining ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                ĐĂNG NHẬP
                                <ArrowRight className="w-7 h-7" />
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Small footer note */}
                <p className="mt-10 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
                    Hackathon Prototype • SnapLearn
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
