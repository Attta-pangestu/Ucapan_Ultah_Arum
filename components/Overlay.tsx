import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Phase } from '../types';
import { AudioManager } from '../utils/audio';

interface AppreciationSlide {
  title: string;
  content: string;
  icon: string;
}

const appreciationSlides: AppreciationSlide[] = [
  {
    title: "Perjuangan",
    content: "Setiap langkahmu penuh perjuangan yang tak terlihat, tapi kau tetap melangkah maju dengan kepala tegak",
    icon: "💪"
  },
  {
    title: "Keberanian",
    content: "Keberanianmu menghadapi dunia menginspirasi semua orang di sekitarmu",
    icon: "🦁"
  },
  {
    title: "Harapan",
    content: "Di usia 26, dunia menantimu dengan peluang tak terbatas dan mimpi yang menanti diraih",
    icon: "✨"
  },
  {
    title: "Kedewasaan",
    content: "Selamat memasuki fase baru penuh kedewasaan, kebijaksanaan, dan cinta",
    icon: "🌸"
  }
];

const birthdayMessage = `Selamat Ulang Tahun ke-26, Arum!

Di usia ini, dunia ada di genggamanmu.
Semoga setiap target tercapai,
kerja keras membuahkan hasil,
dan kamu tetap bersinar
menjadi dirimu yang luar biasa.

Teruslah menginspirasi!

With love 💚`;

// --- 2D Components ---

interface MascotProps {
  className?: string;
}

const CartoonMascot: React.FC<MascotProps> = ({ className = "fixed bottom-4 left-4 md:bottom-8 md:left-8" }) => {
  return (
    <div className={`${className} z-50 flex items-end gap-3 pointer-events-none`}>
      
      {/* 2D Cake with Animated Flame */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 mr-2">
        {/* Plate */}
        <div className="absolute bottom-0 w-full h-2 bg-gray-200 rounded-full" />
        {/* Cake Body */}
        <div className="absolute bottom-2 left-2 right-2 h-10 bg-pink-300 rounded-lg border-2 border-pink-400" />
        <div className="absolute bottom-12 left-2 right-2 h-2 bg-white rounded-full opacity-50" />
        {/* Frosting Drips */}
        <div className="absolute bottom-9 left-2 right-2 h-4 bg-white rounded-t-lg flex justify-around">
            <div className="w-2 h-3 bg-white rounded-full -mb-1"></div>
            <div className="w-2 h-4 bg-white rounded-full -mb-2"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-3 bg-white rounded-full -mb-1"></div>
        </div>
        
        {/* Candle */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-2 h-6 bg-yellow-200 border border-yellow-400" />
        
        {/* Animated Flame */}
        <div className="absolute bottom-[4.5rem] left-1/2 transform -translate-x-1/2 w-3 h-4 bg-orange-500 rounded-full rounded-t-none animate-pulse origin-bottom">
           <div className="absolute bottom-0 left-0.5 w-2 h-3 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>

      {/* Cartoon Bear */}
      <div className="relative w-20 h-24 md:w-24 md:h-28">
         {/* Ears */}
         <div className="absolute top-0 left-1 w-6 h-6 bg-amber-700 rounded-full" />
         <div className="absolute top-0 right-1 w-6 h-6 bg-amber-700 rounded-full" />
         
         {/* Head */}
         <div className="absolute top-2 w-full h-20 bg-amber-600 rounded-full border-2 border-amber-800 z-10 flex flex-col items-center justify-center">
            {/* Eyes */}
            <div className="flex gap-4 mt-4">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
            </div>
            {/* Snout */}
            <div className="w-8 h-6 bg-amber-200 rounded-full mt-1 flex justify-center items-center">
                <div className="w-3 h-2 bg-black rounded-full mt-1" />
            </div>
            {/* Cheeks */}
            <div className="absolute top-10 left-2 w-3 h-2 bg-pink-400 rounded-full opacity-60" />
            <div className="absolute top-10 right-2 w-3 h-2 bg-pink-400 rounded-full opacity-60" />
         </div>
         
         {/* Body (Partial) */}
         <div className="absolute bottom-0 left-2 right-2 h-10 bg-amber-700 rounded-t-xl" />
      </div>

      {/* Speech Bubble */}
      <div className="absolute bottom-28 left-0 md:left-10 bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-lg animate-bounce">
        <p className="text-pink-600 font-bold text-sm md:text-base whitespace-nowrap">
          Happy Birthday Arum! 🎉
        </p>
      </div>
    </div>
  );
};

export const Overlay: React.FC = () => {
  const phase = useStore(state => state.phase);
  const setPhase = useStore(state => state.setPhase);
  const [showVideo, setShowVideo] = useState(false);

  const handleStart = async () => {
    await AudioManager.init();
    AudioManager.playSound('bgm');
    setPhase(Phase.Envelope);
  };

  const handleOpenVideo = () => {
      AudioManager.pauseBgm();
      setShowVideo(true);
  };

  const handleCloseVideo = () => {
      AudioManager.resumeBgm();
      setShowVideo(false);
  };

  // Intro Screen
  if (phase === Phase.Intro) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-green-950 to-black z-50 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-green-400/10 animate-pulse"
              style={{
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center text-center p-6 w-full max-w-md h-full justify-center">
          
          {/* Top Section */}
          <div className="mb-8 animate-fade-in-up">
            <p className="text-green-300/90 font-serif italic text-xl md:text-2xl mb-4 drop-shadow-md">Selamat Ulang Tahun</p>
            <h1
              className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-green-200 via-green-100 to-green-200 tracking-widest drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              ARUM
            </h1>
          </div>

          {/* Slogan */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
             <p 
               className="text-lg md:text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 tracking-wide"
               style={{ fontFamily: "'Playfair Display', serif" }}
             >
               "Aurum Splendet in Aeternum"
             </p>
             <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-3 opacity-50" />
          </div>

          {/* Mascot Center Stage - Increased Spacing */}
          <div className="mb-16 scale-110 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
             <CartoonMascot className="relative transform-none" />
          </div>

          {/* Start Button - Custom Text */}
          <div className="animate-fade-in-up w-full px-4" style={{ animationDelay: "0.6s" }}>
            <button
                onClick={handleStart}
                className="group relative px-8 py-4 w-full md:w-auto overflow-hidden rounded-full transition-all duration-500 border border-green-600/50 hover:border-green-400 hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] hover:scale-[1.02] active:scale-95"
            >
                <div className="absolute inset-0 bg-green-900/40 group-hover:bg-green-800/60 transition-all duration-500" />
                <span className="relative text-green-50 normal-case tracking-wider text-sm md:text-base font-serif italic">
                  "Aku siapin surprises buat kamu, klik sini ya Arum"
                </span>
            </button>
            <p className="mt-4 text-green-500/40 text-[10px] tracking-widest uppercase animate-pulse">
                Tap to Open
            </p>
          </div>

        </div>
      </div>
    );
  }

  // Interruption Phase (Bridge to Beach)
  if (phase === Phase.Interruption) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black z-50 animate-fade-in">
        <div className="text-center p-8">
          <p
            className="text-2xl md:text-4xl text-white font-serif tracking-wide leading-relaxed"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "Eits bentar...<br/>
            tolong baca pesan-pesan ku ini ya Arum"
          </p>
          <div className="mt-6 w-16 h-1 bg-green-500 mx-auto rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // Persistent Hints Layer
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 flex flex-col justify-between p-8">
      <div className="text-center w-full">
        {phase === Phase.Envelope && (
          <p className="text-green-800/50 text-xs tracking-[0.5em] uppercase animate-pulse">
            Untuk Arum
          </p>
        )}
      </div>

      {/* Render Cartoon Mascot only during Cake Phase (Corner) */}
      {phase === Phase.Cake && <CartoonMascot className="fixed bottom-4 left-4 md:bottom-8 md:left-8 animate-slide-up" />}

      <div className="text-center w-full mb-10">
        {phase === Phase.Envelope && (
          <div className="animate-bounce">
            <p className="text-green-900/80 font-serif text-lg tracking-wider">
              Geser amplop ke atas untuk membuka
            </p>
            <p className="text-green-800/50 text-xs mt-2">
              ✨
            </p>
          </div>
        )}

        {phase === Phase.Cake && (
          <div className="animate-pulse">
            <p className="text-white text-opacity-80 font-serif text-xl tracking-wider">
              Make a wish & Tiup Lilinnya
            </p>
            <p className="text-xs text-gray-500 mt-2">
              (Klik api lilin atau tiup ke mikrofon)
            </p>
          </div>
        )}

        {phase === Phase.Beach && (
           <div className="animate-fade-in-up flex flex-col items-center gap-4">
             <p className="text-white/90 font-serif text-lg tracking-wider drop-shadow-md">
               Geser layar untuk berkeliling pantai
             </p>
             
             {/* CTA Video Button */}
             <button 
                onClick={handleOpenVideo}
                className="bg-white/10 backdrop-blur-md border border-white/30 px-6 py-2 rounded-full text-white font-serif hover:bg-white/20 transition-all flex items-center gap-2 pointer-events-auto cursor-pointer"
             >
                <span>🎬</span> Lihat Video Ucapan
             </button>

             <p className="text-white/60 text-xs mt-1">
               ✨ Baca setiap papan ucapan ✨
             </p>
           </div>
        )}
      </div>

      {/* Cinema Mode Modal */}
      {showVideo && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 animate-fade-in">
              <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                  <video 
                    src="/video_ultah.webm" 
                    className="w-full h-full object-contain" 
                    controls 
                    autoPlay
                  />
                  <button 
                    onClick={handleCloseVideo}
                    className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all text-xl"
                  >
                    ✕
                  </button>
              </div>
              <button 
                onClick={handleCloseVideo}
                className="mt-8 text-white/50 hover:text-white transition-colors uppercase tracking-widest text-xs"
              >
                Kembali ke Pantai
              </button>
          </div>
      )}
    </div>
  );
};