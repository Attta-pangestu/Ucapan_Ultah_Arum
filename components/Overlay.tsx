import React from 'react';
import { useStore } from '../store';
import { Phase } from '../types';
import { AudioManager } from '../utils/audio';

export const Overlay: React.FC = () => {
  const phase = useStore(state => state.phase);
  const setPhase = useStore(state => state.setPhase);

  const handleStart = async () => {
    await AudioManager.init();
    AudioManager.playSound('bgm');
    setPhase(Phase.Cake);
  };

  const handleManualBlow = () => {
    // Triggers the logic inside Cake component via state, but we need to ensure state is shared or event is dispatched.
    // The Cake component listens to Phase.Cake and user interaction. 
    // To support button click blowing, we can't easily reach inside Cake.
    // However, the Cake component's Click handler does the logic.
    // We can simulate it by setting a transient state or just instructing the user.
    // For simplicity, we just guide the user to Tap the Cake.
  };

  if (phase === Phase.Intro) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 transition-opacity duration-1000">
        <div className="text-center p-8 border border-green-800 rounded-lg bg-black">
          <h1 className="text-4xl md:text-6xl font-serif text-green-100 mb-6 font-bold tracking-widest">
            ARUM'S 26TH
          </h1>
          <p className="text-gray-400 mb-8 font-light italic">
            A Cinematic Matcha Journey
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-green-900 text-green-100 hover:bg-green-800 transition-colors rounded-full uppercase tracking-widest text-sm"
          >
            Enter Experience
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 flex flex-col justify-between p-8">
      <div className="text-center w-full">
         {/* Top Header if needed */}
      </div>

      <div className="text-center w-full mb-10">
        {phase === Phase.Cake && (
          <div className="animate-pulse">
            <p className="text-white text-opacity-80 font-serif text-lg tracking-wider">
              Make a wish &amp; Blow the candles
            </p>
            <p className="text-xs text-gray-500 mt-2">
              (Tap the candles or blow into microphone)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};