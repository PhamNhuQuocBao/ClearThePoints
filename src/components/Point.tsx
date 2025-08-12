import React, { useEffect, useState } from "react";
import { TIME_TO_HIDE_POINT } from "../constants";

interface PointProps {
  id: string;
  x: number;
  y: number;
  number: number;
  isClicked: boolean;
  isVisible: boolean;
  onClick: (id: string) => void;
  disabled: boolean;
  gameState: string; // thêm prop này
}

const Point: React.FC<PointProps> = React.memo(
  ({
    id,
    x,
    y,
    number,
    isClicked,
    isVisible,
    onClick,
    disabled,
    gameState,
  }) => {
    const [countdown, setCountdown] = useState(TIME_TO_HIDE_POINT / 1000);

    const handleClick = () => {
      if (!disabled && !isClicked) {
        onClick(id);
      }
    };

    useEffect(() => {
      if (isClicked && gameState === "Playing") {
        setCountdown(TIME_TO_HIDE_POINT / 1000); // reset countdown
        const interval = setInterval(() => {
          setCountdown((prev) => {
            const next = parseFloat((prev - 0.1).toFixed(1));
            if (next <= 0) {
              clearInterval(interval);
              return 0;
            }
            return next;
          });
        }, 100); // update mỗi 0.1s

        return () => clearInterval(interval);
      }
    }, [isClicked, gameState]);

    if (!isVisible) return null;

    // Tính opacity: từ 1 → 0 khi countdown giảm
    const opacity =
      isClicked && TIME_TO_HIDE_POINT > 0
        ? Math.max(countdown / (TIME_TO_HIDE_POINT / 1000), 0)
        : 1;

    return (
      <div
        className={`point ${isClicked ? "clicked" : ""}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          opacity: opacity,
          pointerEvents: disabled ? "none" : "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.1s linear",
          backgroundColor: isClicked ? "orange" : "white",
          zIndex: isClicked ? 9999 : 1,
        }}
        onClick={handleClick}
      >
        <span>{number}</span>
        {isClicked && <span>{countdown.toFixed(1)}</span>}
      </div>
    );
  }
);

export default Point;
