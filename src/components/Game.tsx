import React, { useState, useEffect, useCallback, useRef } from "react";
import GameArea from "./GameArea";
import type { PointData, GameState } from "../types/game";
import {
  TIME_TO_HIDE_POINT,
  MARGIN_POINT,
  MAX_NONOVERLAP_COUNT,
  POINT_SIZE,
  AUTO_CLICK_DELAY,
} from "../constants";

const Game: React.FC = () => {
  const [pointCount, setPointCount] = useState(5);
  const [points, setPoints] = useState<PointData[]>([]);
  const [gameState, setGameState] = useState<GameState>("Ready");
  const [nextExpectedNumber, setNextExpectedNumber] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const hideTimeoutsRef = useRef<number[]>([]);
  const lastAutoClickTimeRef = useRef<number>(0);
  const autoPlayFrameRef = useRef<number | null>(null);

  // Generate random points
  const generatePoints = useCallback(() => {
    if (!gameAreaRef.current) return;

    const container = gameAreaRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const newPoints: PointData[] = [];

    for (let i = 1; i <= pointCount; i++) {
      let attempts = 0;
      let x: number, y: number;
      let validPosition = false;

      while (attempts < 100 && !validPosition) {
        x =
          Math.random() * (containerWidth - POINT_SIZE - 2 * MARGIN_POINT) +
          MARGIN_POINT;
        y =
          Math.random() * (containerHeight - POINT_SIZE - 2 * MARGIN_POINT) +
          MARGIN_POINT;

        if (pointCount > MAX_NONOVERLAP_COUNT) {
          validPosition = true;
        } else {
          validPosition = newPoints.every((point) => {
            const distance = Math.sqrt(
              Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
            );
            return distance > POINT_SIZE + 10;
          });
        }

        attempts++;
      }

      if (validPosition) {
        newPoints.push({
          id: `${Date.now()}-${i}`,
          x: x!,
          y: y!,
          number: i,
          isClicked: false,
          isVisible: true,
        });
      }
    }

    setPoints(newPoints);
  }, [pointCount]);

  // Handle point click
  const handlePointClick = useCallback(
    (pointId: string) => {
      const clickedPoint = points.find((p) => p.id === pointId);
      if (!clickedPoint || clickedPoint.isClicked) return;

      setPoints((prev) =>
        prev.map((p) => (p.id === pointId ? { ...p, isClicked: true } : p))
      );

      if (clickedPoint.number === nextExpectedNumber) {
        // Correct order
        setNextExpectedNumber((prev) => prev + 1);

        // Hide point after TIME_TO_HIDE_POINT
        const timeout = setTimeout(() => {
          setPoints((prev) => {
            const updated = prev.map((p) =>
              p.id === pointId ? { ...p, isVisible: false } : p
            );

            // Check if all points are cleared AFTER hiding the current point
            const allPointsClicked = updated.every((p) => p.isClicked);
            const allPointsHidden = updated.every((p) => !p.isVisible);

            // Only set "All Cleared" when all points are both clicked AND hidden
            if (allPointsClicked && allPointsHidden) {
              setGameState("All Cleared");
            }

            return updated;
          });
        }, TIME_TO_HIDE_POINT);

        hideTimeoutsRef.current.push(timeout);
      } else {
        // Wrong order - game over
        setGameState("Game Over");
      }
    },
    [points, nextExpectedNumber]
  );

  // Timer logic
  useEffect(() => {
    const updateTimer = () => {
      if (gameState === "Playing") {
        const currentTime = Date.now();
        const elapsed = (currentTime - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);
      }
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    if (gameState === "Game Over") {
      hideTimeoutsRef.current.forEach((t) => clearTimeout(t));
      hideTimeoutsRef.current = [];
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState]);

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || gameState !== "Playing") {
      // Stop auto-play animation frame if conditions not met
      if (autoPlayFrameRef.current) {
        cancelAnimationFrame(autoPlayFrameRef.current);
        autoPlayFrameRef.current = null;
      }
      return;
    }

    const autoClickFrame = () => {
      const currentTime = Date.now();

      // Check if enough time has passed since last auto-click
      if (currentTime - lastAutoClickTimeRef.current >= AUTO_CLICK_DELAY) {
        const nextPoint = points.find(
          (p) => p.number === nextExpectedNumber && !p.isClicked && p.isVisible
        );

        if (nextPoint) {
          handlePointClick(nextPoint.id);
          lastAutoClickTimeRef.current = currentTime;
        } else {
          // No more points to click, stop auto-play
          setAutoPlay(false);
          return;
        }
      }

      // Continue the animation loop
      if (autoPlay && gameState === "Playing") {
        autoPlayFrameRef.current = requestAnimationFrame(autoClickFrame);
      }
    };

    // Initialize timing for first auto-click
    if (lastAutoClickTimeRef.current === 0) {
      lastAutoClickTimeRef.current = Date.now();
    }

    // Start the auto-play loop
    autoPlayFrameRef.current = requestAnimationFrame(autoClickFrame);

    // Cleanup function
    return () => {
      if (autoPlayFrameRef.current) {
        cancelAnimationFrame(autoPlayFrameRef.current);
        autoPlayFrameRef.current = null;
      }
    };
  }, [
    autoPlay,
    gameState,
    nextExpectedNumber,
    pointCount,
    points,
    handlePointClick,
  ]);

  // Restart game
  const handleRestart = useCallback(() => {
    setAutoPlay(false);
    generatePoints();
    setGameState("Playing");
    setNextExpectedNumber(1);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    lastAutoClickTimeRef.current = 0; // Reset auto-click timer
  }, [generatePoints]);

  // Toggle auto-play
  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => !prev);
  }, []);

  return (
    <div className="game">
      <h1
        className="title"
        style={{
          color:
            gameState === "All Cleared"
              ? "green"
              : gameState === "Game Over"
              ? "red"
              : "black",
        }}
      >
        {gameState === "All Cleared"
          ? "All Cleared"
          : gameState === "Game Over"
          ? "Game Over"
          : "Let's Play"}
      </h1>
      <div className="game-container">
        <div className="game-settings">
          <label>
            Points:
            <input
              type="number"
              min="1"
              value={pointCount}
              onChange={(e) => setPointCount(parseInt(e.target.value) || 1)}
              className="points-input"
              style={{ width: "100%", maxWidth: "200px" }}
            />
          </label>
        </div>
      </div>
      <div className="game-info">
        <div className="info-row">
          <span>Time: {elapsedTime.toFixed(1)}s</span>
        </div>
        <div className="game-controls">
          <button
            className="control-btn restart-btn"
            onClick={handleRestart}
            disabled={gameState === "Playing" && points.length === 0}
          >
            {gameState === "Ready" ? "Play" : "Restart"}
          </button>
          <button
            className={`control-btn auto-play-btn ${autoPlay ? "active" : ""}`}
            onClick={toggleAutoPlay}
            hidden={gameState !== "Playing"}
          >
            {autoPlay ? "Auto Play OFF" : "Auto Play ON"}
          </button>
        </div>
      </div>

      <GameArea
        ref={gameAreaRef}
        points={points}
        onPointClick={handlePointClick}
        disabled={gameState !== "Playing" || autoPlay}
        gameState={gameState}
      />

      {gameState === "Playing" && nextExpectedNumber <= pointCount && (
        <p>Next: {nextExpectedNumber}</p>
      )}
    </div>
  );
};

export default Game;
