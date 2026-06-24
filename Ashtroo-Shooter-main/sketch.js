// ================= VARIABLES =================
let modelLoaded = false;
let shootSound;
let modelLoadingStarted = false;

let lastPredictionTime = 0;
let predictionInterval = 30;
let paddle;
let obstacles = [];
let score = 0;
let highScore = 0;
let isGameOver = false;
let loadingProgress = 0;
let targetProgress = 0;

let video, handpose;
let predictions = [];

let img1, img2, img3;

let handX = null;
let smoothX = 300;

let flag = false;
let appState = "IDLE"; 
let bulletsFired = 0; 
// LOADING → QUIZ → GAME → GAMEOVER
function startGame() {
  document.getElementById("startScreen").style.display = "none";

  appState = "LOADING";   // 🔥 go to loading screen
  initHandpose();         // 🔥 start model loading

  loop();
}

// Gesture control
let lastShotTime = 0;
let shootCooldown = 400;

function getFingerState(hand) {
  let tips = [8, 12, 16, 20];   // index, middle, ring, pinky
  let bases = [5, 9, 13, 17];

  let states = [];

  for (let i = 0; i < tips.length; i++) {
    let tipY = hand.landmarks[tips[i]][1];
    let baseY = hand.landmarks[bases[i]][1];

    states.push(tipY < baseY); // true = finger up
  }

  return states; // [index, middle, ring, pinky]
}
let gameStarted = false;

// Gesture smoothing
let pinchCount = 0;
let fistCount = 0;

let pinchThreshold = 5;
let fistThreshold = 7;

// ================= PRELOAD =================
function preload() {
  img1 = loadImage('img1.png');
  img2 = loadImage('img2.png');
  img3 = loadImage('bkgn.png');
}

// ================= SETUP =================
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.elt.setAttribute("tabindex", "0");
  canvas.elt.focus();

  // ❌ REMOVE model + camera from here
  // video = createCapture(...)
  // handpose = ml5.handpose(...)

  // ✅ ONLY keep game initialization
  if (localStorage.getItem("highScore")) {
    highScore = int(localStorage.getItem("highScore"));
  }
  try {
    shootSound = loadSound('sounds/laser.mp3');
  } catch (e) {
    console.log("Sound failed to load", e);
  }

  paddle = new Paddle();
}
function initHandpose() {

  if (modelLoaded || modelLoadingStarted) return;

  modelLoadingStarted = true;

  video = createCapture(VIDEO);
  video.size(260, 220);   // 🔥 IMPORTANT (was 600x600)
  video.hide();

  handpose = ml5.handpose(video, () => {
    console.log("Model loaded ✅");

    modelLoaded = true;
    appState = "GAME";
  });

  handpose.on("predict", results => {
    if (millis() - lastPredictionTime > predictionInterval) {
      predictions = results;
      lastPredictionTime = millis();
    }
  });
}
// ================= DRAW =================
function draw() {

  // ================= QUIZ STATE =================
  if (appState === "QUIZ") {
    showQuiz();
    return;
  }
// 🎯 Smooth realistic loading %
targetProgress = modelLoaded ? 100 : 90;

// smooth increase
loadingProgress = lerp(loadingProgress, targetProgress, 0.05);

// keep within bounds
loadingProgress = constrain(loadingProgress, 0, 100);

// convert for bar
let progress = loadingProgress / 100;
  // ================= MODEL LOADING =================
  if (appState === "LOADING") {
    if (modelLoaded) {
    appState = "GAME";
    }

    // 🔥 YOUR SAME LOADING SCREEN (UNCHANGED)
    background(5, 5, 20);

    for (let i = 0; i < 30; i++) {
      let x = (i * 73 + frameCount * 2) % width;
      let y = (i * 37) % height;
      stroke(255);
      point(x, y);
    }

    let glow = 200 + sin(frameCount * 0.1) * 55;

    fill(0, glow, 255);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("ASTRO SHOOTER", width / 2, height / 2 - 120);

    fill(180);
    textSize(18);
    text("Loading AI Model...", width / 2, height / 2 - 60);

    let progress = (frameCount % 200) / 200;

    noStroke();
    fill(50);
    rect(width / 2 - 150, height / 2, 300, 20, 10);

    fill(0, 255, 200);
    rect(width / 2 - 150, height / 2, 300 * progress, 20, 10);

    fill(255);
textSize(18);
textAlign(CENTER, CENTER);

// show percentage
text(floor(loadingProgress) + " %", width / 2, height / 2 + 40);

    push();
    translate(width / 2 + sin(frameCount * 0.05) * 100, height / 2 + 100);
    rotate(sin(frameCount * 0.05) * 0.2);

    fill(200);
    triangle(-10, 10, 10, 10, 0, -20);

    fill(255, 100, 0);
    ellipse(0, 15 + random(5), 5, 10);
    pop();

    // push();
    // translate(width / 2, height / 2 + 150);
    // rotate(frameCount * 0.05);
    // stroke(0, 255, 255);
    // noFill();
    // ellipse(0, 0, 60);
    // line(0, 0, 30, 0);
    // pop();
    if (appState === "GAMEOVER") {
  document.getElementById("backDashboardBtn").style.display = "block";
} else {
  document.getElementById("backDashboardBtn").style.display = "none";
}

    return;
  }

  // ================= GAME STATE =================
  if (appState === "GAME") {

    background(img3);
    image(video, width - 120, 10, 100, 100);

    handleHandControls();

    if (!isGameOver) {
  updateGame();
} else {
  // 🔥 SAVE SCORE ONLY ONCE
  if (appState !== "GAMEOVER") {
    saveScore();   // ✅ THIS WAS MISSING
  }

  appState = "GAMEOVER";
}
  }

  // ================= GAME OVER =================
  if (appState === "GAMEOVER") {
  background(img3);
  showGameOver();

  document.getElementById("gameOverButtons").style.display = "flex";
} else {
  document.getElementById("gameOverButtons").style.display = "none";
}

  showFPS();
}

// ================= HAND CONTROLS =================
function handleHandControls() {
  if (predictions.length > 0) {
    let hand = predictions[0];
    let index = hand.landmarks[8];

    if (!gameStarted) gameStarted = true;

    // ================= SMOOTH MOVEMENT FIX =================

    // ✅ correct mapping (no reverse)
    handX = map(index[0], 0, video.width, width,0);

    // ✅ dead zone (removes tiny shaking)
    let threshold = 8;

    if (abs(handX - smoothX) > threshold) {
      // ✅ slower smoothing (very important)
      smoothX = lerp(smoothX, handX, 0.12);
    }

    // ✅ final paddle position
    paddle.x = constrain(smoothX - paddle.width / 2, 0, width - paddle.width);

    // ================= FINGER STATES =================

    let fingers = getFingerState(hand);

    let indexUp = fingers[0];
    let middleUp = fingers[1];
    let ringUp = fingers[2];
    let pinkyUp = fingers[3];

    // -------------------------
    // ☝️ INDEX ONLY → SHOOT
    // -------------------------
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      pinchCount++;
    } else {
      pinchCount = 0;
    }

    if (pinchCount > 5 && millis() - lastShotTime > shootCooldown) {
      paddle.shoot();
      lastShotTime = millis();
      pinchCount = 0;
    }

    // -------------------------
    // ✋ OPEN HAND → MOVE ONLY
    // -------------------------
    let allOpen = indexUp && middleUp && ringUp && pinkyUp;

    // ================= UI FEEDBACK =================

    fill(0, 255, 0);
    noStroke();
    ellipse(smoothX, index[1], 15);

    fill(255);
    textSize(16);

    if (indexUp && !middleUp) {
      text("SHOOT ☝️", 10, 60);
    } else if (allOpen) {
      text("MOVE ✋", 10, 60);
    } else {
      text("READY...", 10, 60);
    }
  }
}

// ================= GAME LOGIC =================
function updateGame() {
  paddle.move();
  paddle.show();

  for (let bullet of paddle.bullets) {
    bullet.update();
    bullet.show();

    for (let j = obstacles.length - 1; j >= 0; j--) {
      if (bullet.hits(obstacles[j])) {
        bullet.toDelete = true;
        obstacles.splice(j, 1);
        score++;
        if (shootSound) {
    if (shootSound.isPlaying()) {
      shootSound.stop();
    }
    shootSound.play();
  }
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", highScore);
        }
      }
    }
  }

  paddle.bullets = paddle.bullets.filter(b => !b.isOffscreen() && !b.toDelete);

  if (frameCount % 90 === 0) {
    obstacles.push(new Obstacle());
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].hits(paddle)) {
      isGameOver = true;
      saveScore();
      return;
    }

    if (obstacles[i].y > height) {
      obstacles.splice(i, 1);
    } else {
      obstacles[i].update();
      obstacles[i].show();
    }
  }

  fill(255);
  textSize(20);
  textAlign(CENTER);
  text(`Score: ${score} | High Score: ${highScore} | Bullets: ${bulletsFired}`, width / 2, 30);
}

// ================= UI =================

function showGameOver() {
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);

  textSize(20);
}

function showFPS() {
  fill(255);
  textSize(14);
  textAlign(LEFT, BOTTOM);
  text('FPS: ' + floor(frameRate()), 10, height - 10);
}

// ================= CLASSES =================
class Paddle {
  constructor() {
    this.width = 60;
    this.height = 90;
    this.x = width / 2 - this.width / 2;
    this.y = height - this.height - 10;
    this.bullets = [];
    this.lastShotTime = 0;
  }

  move() {
    this.x = constrain(this.x, 0, width - this.width);
  }

  show() {
    image(img2, this.x, this.y, this.width, this.height);
  }

  shoot() {
  this.bullets.push(new Bullet(this.x + this.width / 2 - 1, this.y));
  bulletsFired++; 

  if (shootSound) {
    if (shootSound.isPlaying()) {
      shootSound.stop();
    }
    shootSound.play();
  }
}
}

class Obstacle {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.x = random(width - this.width);
    this.y = 0;
    this.speed = min(10, 6 + score * 0.2);
  }

  update() {
    this.y += this.speed;
  }

  show() {
    image(img1, this.x, this.y, this.width, this.height);
  }

  hits(paddle) {
    return (
      this.y + this.height >= paddle.y &&
      this.y + this.height <= paddle.y + paddle.height &&
      this.x + this.width >= paddle.x &&
      this.x <= paddle.x + paddle.width
    );
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.ySpeed = -(6 + score * 0.2);
    this.toDelete = false;
    
  }
  update() {
    this.y += this.ySpeed;
  }

  show() {
    fill(0, 255, 0);
    rect(this.x, this.y, 4, 10);
  }

  isOffscreen() {
    return this.y < 0;
  }

  hits(enemy) {
    return (
      this.x > enemy.x &&
      this.x < enemy.x + enemy.width &&
      this.y > enemy.y &&
      this.y < enemy.y + enemy.height
    );
  }
}

// ================= RESTART =================
// function keyPressed() {

//   // ================= QUIZ INPUT =================
//   // if (appState === "QUIZ") {
//   //   handleQuizInput(key);
//   //   return; // stop here, don’t trigger game logic
//   // }

//   // ================= GAME OVER RESTART =================
//  if (appState === "GAMEOVER") {

//   // 🔁 Restart
//   if (key === 'r' || key === 'R') {
//     obstacles = [];
//     score = 0;
//     isGameOver = false;

//     paddle = new Paddle();
//     paddle.bullets = [];
//     paddle.x = width / 2 - paddle.width / 2;

//     appState = "GAME";
//     loop();
//   }

//   // 🏠 Dashboard
//   if (key === 'b' || key === 'B') {
//     document.getElementById("startScreen").style.display = "flex";

//     // 🔥 RESET GAME STATE
//     obstacles = [];
//     score = 0;
//     isGameOver = false;

//     appState = "IDLE";
//     noLoop();
//   }
// }
// }
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function saveScore() {
  console.log("🔥 Saving score...");

  let user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    console.log("❌ No user found");
    return;
  }

  db.collection("leaderboard").add({
    name: user.displayName,
    score: score,
    time: Date.now()
  })
  .then(() => console.log("✅ Score saved"))
  .catch(err => console.error("❌ Save error:", err));
}

