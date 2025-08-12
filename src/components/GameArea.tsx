import React, { forwardRef } from "react";
import Point from "./Point";
import type { GameState, PointData } from "../types/game";

interface GameAreaProps {
  points: PointData[];
  onPointClick: (id: string) => void;
  disabled: boolean;
  gameState: GameState;
}

const GameArea = forwardRef<HTMLDivElement, GameAreaProps>(
  ({ points, onPointClick, disabled, gameState }, ref) => {
    return (
      <div>
        <div className="game-canvas" ref={ref}>
          {points.map((point) => (
            <Point
              key={point.id}
              id={point.id}
              x={point.x}
              y={point.y}
              number={point.number}
              isClicked={point.isClicked}
              isVisible={point.isVisible}
              onClick={onPointClick}
              disabled={disabled}
              gameState={gameState}
            />
          ))}
        </div>
      </div>
    );
  }
);

GameArea.displayName = "GameArea";

export default React.memo(GameArea);
