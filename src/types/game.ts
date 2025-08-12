export interface PointData {
  id: string;
  x: number;
  y: number;
  number: number;
  isClicked: boolean;
  isVisible: boolean;
}

export type GameState = "Playing" | "Game Over" | "All Cleared" | "Ready";

export interface GameSettings {
  pointCount: number;
  autoPlay: boolean;
  autoPlaySpeed: number;
}
