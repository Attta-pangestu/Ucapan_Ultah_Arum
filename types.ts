export enum Phase {
  Intro = 0,
  Cake = 1,
  Blowing = 2,
  Fireworks = 3,
  Message = 4,
}

export interface ParticleState {
  positions: Float32Array;
  targetPositions: Float32Array;
  colors: Float32Array;
}
