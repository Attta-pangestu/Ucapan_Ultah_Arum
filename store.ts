import { create } from 'zustand';
import { Phase } from './types';

interface AppState {
  phase: Phase;
  setPhase: (phase: Phase) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  isInteracting: boolean;
  setIsInteracting: (isInteracting: boolean) => void;
  nextPhase: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  phase: Phase.Intro,
  audioEnabled: false,
  isInteracting: false,
  setPhase: (phase) => set({ phase }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  setIsInteracting: (isInteracting) => set({ isInteracting }),
  nextPhase: () => {
    const current = get().phase;
    if (current < Phase.Message) {
      set({ phase: current + 1 });
    }
  }
}));