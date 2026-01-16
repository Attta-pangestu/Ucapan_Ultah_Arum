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

const CartoonMascot: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 flex items-end gap-3 animate-slide-up pointer-events-none">
      
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

  const handleStart = async () => {
    await AudioManager.init();
    AudioManager.playSound('bgm');
    setPhase(Phase.Envelope);
  };

  // Intro Screen
  if (phase === Phase.Intro) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-green-950 to-black z-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-green-400/20 animate-pulse"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative text-center p-6 md:p-12 max-w-lg w-full">
          <h1
            className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-green-200 via-green-100 to-green-200 mb-2 md:mb-4 tracking-wider"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            ARUM
          </h1>
          <p
            className="text-xl md:text-3xl text-green-300/80 mb-8 md:mb-10 tracking-widest"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            26th Birthday
          </p>

          <button
            onClick={handleStart}
            className="group relative px-8 py-3 md:px-12 md:py-4 overflow-hidden rounded-full transition-all duration-500 border border-green-700 hover:border-green-500 active:scale-95 touch-manipulation"
          >
            <div className="absolute inset-0 bg-green-900/50 group-hover:bg-green-800/80 transition-all duration-500" />
            <span className="relative text-green-100 uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm font-light">
              Mulai
            </span>
          </button>
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

      {/* Render Cartoon Mascot only during Cake Phase */}
      {phase === Phase.Cake && <CartoonMascot />}

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
              (Klik api lilin atau tiup ke mic)
            </p>
          </div>
        )}

        {phase === Phase.Beach && (
           <div className="animate-fade-in-up">
             <p className="text-white/90 font-serif text-lg tracking-wider drop-shadow-md">
               Geser layar untuk berkeliling pantai
             </p>
             <p className="text-white/60 text-xs mt-1">
               ✨ Baca setiap papan ucapan ✨
             </p>
           </div>
        )}
      </div>
    </div>
  );
};