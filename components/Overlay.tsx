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
        {/* Animated background particles */}
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

        <div className="relative text-center p-12 max-w-lg">
          {/* Envelope icon */}
          <div className="mb-8 relative">
            <div className="w-32 h-24 mx-auto bg-gradient-to-br from-green-800 to-green-900 rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-green-700 to-green-800"
                style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-yellow-400 shadow-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-green-200 via-green-100 to-green-200 mb-4 tracking-wider"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            ARUM
          </h1>

          <p
            className="text-2xl md:text-3xl text-green-300/80 mb-2 tracking-widest"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            26th Birthday
          </p>

          <p className="text-green-500/60 mb-10 text-sm tracking-widest uppercase">
            A Cinematic Matcha Journey
          </p>

          {/* Decorative line */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-10" />

          <button
            onClick={handleStart}
            className="group relative px-12 py-4 overflow-hidden rounded-full transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-800 via-green-700 to-green-800 group-hover:from-green-700 group-hover:via-green-600 group-hover:to-green-700 transition-all duration-500" />
            <span className="relative text-green-100 uppercase tracking-[0.3em] text-sm font-light">
              Buka Amplop
            </span>
          </button>

          <p className="mt-6 text-green-600/50 text-xs">
            ✨ Tap untuk memulai pengalaman magis
          </p>
        </div>
      </div>
    );
  }

  // Hints Layer (Pointer Events None)
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 flex flex-col justify-between p-8">
      <div className="text-center w-full">
        {phase === Phase.Envelope && (
          <p className="text-green-800/50 text-xs tracking-[0.5em] uppercase animate-pulse">
            Untuk Arum
          </p>
        )}
      </div>

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
              Make a wish & Blow the candles
            </p>
            <p className="text-xs text-gray-500 mt-2">
              (Tap lilin atau tiup ke mikrofon)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};