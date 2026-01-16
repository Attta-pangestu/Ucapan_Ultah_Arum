export enum Phase {
  Intro = 0,
  Envelope = 1,
  Appreciation = 2,
  Cake = 3,
  Blowing = 4,
  Fireworks = 5,
  Message = 6,
}

export interface ParticleState {
  positions: Float32Array;
  targetPositions: Float32Array;
  colors: Float32Array;
}
