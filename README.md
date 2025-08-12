# Clear the points

A small game built with **ReactJS** to practice reflexes and concentration.  
The player needs to click the points in **ascending numerical order (1 → N)** as quickly as possible.

## 🎮 How to Play

1. When the game starts, several points (circles) labeled from `1` to `N` will appear randomly on the screen.
2. Click on the points in **ascending order** (1, 2, 3, ...).
3. When clicking the correct number:
   - That point will be marked as clicked.
   - After **`TIME_TO_HIDE_POINT` seconds**, the point will disappear.
4. If you click the **wrong number** → **Game Over**.
5. When all points are clicked correctly → **All Cleared**.

## ⚙️ Features

- **Smart point placement**:
  - If the number of points is small → automatically avoids overlapping for better visibility.
  - If the number of points is large → allows overlapping to save space.
- **Click highlight**:  
  When a clicked point is overlapped by others, it will appear on top.
- **Game states**:
  - `Playing` — game in progress.
  - `Game Over` — clicked the wrong number.
  - `All Cleared` — all points clicked correctly.
