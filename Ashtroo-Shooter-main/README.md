# 🕹️ Astro Fighter – Hand-Controlled Obstacle Avoidance Game

Astro Fighter is a browser-based shooting game where you control a spaceship using **your hand movements via webcam**. The paddle (ship) follows your index finger, and bullets are automatically fired to destroy falling obstacles.

Built using:
- 🖌️ [p5.js](https://p5js.org/) for graphics and interaction
- 🤖 [ml5.js](https://ml5js.org/) for hand tracking (Handpose)
- 📷 Webcam for gesture-based control

---

# 🚀 How to Play

1. Allow webcam access when prompted.
2. Move your **index finger left or right** in front of the webcam to move the spaceship.
3. The spaceship automatically shoots bullets when your hand is detected.
4. Avoid or destroy falling obstacles to increase your score.
5. The game ends if an obstacle collides with the spaceship.
6. Press `R` to restart the game.

---

# 🛠️ Features

- Real-time hand tracking using the Handpose model
- Gesture-controlled spaceship movement
- Automatic shooting system
- Dynamic difficulty progression
- Score and high-score tracking
- Collision detection system
- Live FPS counter and webcam preview
- Interactive and responsive gameplay



---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/vaishnavi891/Ashtroo-Shooter.git
```

## 2️⃣ Navigate to the Project Folder

```bash
cd Ashtroo-Shooter
```

## 3️⃣ Run the Project

Open `index.html` in your browser  
OR use VS Code Live Server for better performance.

---

# 🧠 Technologies Used

| Technology | Purpose |
|------------|---------|
| p5.js | Game rendering and animations |
| ml5.js | Hand tracking using Handpose |
| JavaScript | Game logic and functionality |
| HTML/CSS | User interface and styling |
| Webcam API | Gesture input detection |

---

# 🎮 Game Mechanics

- The spaceship follows the detected index finger position.
- Bullets are fired automatically.
- Obstacles continuously fall from the top of the screen.
- Players gain points by destroying obstacles.
- Difficulty increases as the score grows.
- Collision detection handles:
  - Bullet vs Obstacle
  - Obstacle vs Spaceship
---

# 🔥 Future Enhancements

- Sound effects and background music
- Power-ups and shield system
- Multiple enemy types
- Gesture-based special attacks
- Multiplayer support
- Mobile compatibility
- AI-based difficulty levels

---

# 🧪 Challenges Faced

- Achieving smooth real-time hand tracking
- Reducing webcam latency
- Accurate gesture recognition
- Efficient collision detection
- Maintaining stable FPS during gameplay

---

# 📈 Learning Outcomes

Through this project, we learned:
- Real-time computer vision basics
- Hand gesture recognition using machine learning
- Browser-based game development
- Collision detection and game physics
