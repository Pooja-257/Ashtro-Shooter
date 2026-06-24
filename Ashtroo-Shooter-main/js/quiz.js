// ================= QUIZ SYSTEM (FINAL CLEAN VERSION) =================

// ---------- STATE ----------
let currentQuestionData = null;
let selectedAnswer = null;

let showWrongMsg = false;
let showCorrectMsg = false;

let optionButtons = [];

let buttonsStartY = 280;
let buttonSpacing = 60;

// 🔥 NEW TIMER + SOUND
let timer = 10;
let maxTime = 15;
let timerInterval;

let tickSound;
let heartbeatSound;

let shakeIntensity = 0;


// ================= START QUIZ =================
function startQuiz() {
  document.getElementById("startScreen").style.display = "none";

  appState = "QUIZ";

  fetchQuestion();

  loop();
}


// ================= FETCH QUESTION =================
async function fetchQuestion() {
  try {
    currentQuestionData = null;

    optionButtons.forEach(btn => btn.remove());
    optionButtons = [];

    let res = await fetch("https://the-trivia-api.com/v2/questions?limit=1&categories=science,maths");
    let data = await res.json();

    let q = data[0];

    let options = [...q.incorrectAnswers];
    options.push(q.correctAnswer);

    options = shuffle(options);

    currentQuestionData = {
      q: q.question.text,
      options: options,
      answer: q.correctAnswer
    };

    createQuizButtons();

    // 🔥 START TIMER
    timer = maxTime;

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

      timer--;

      // 🔊 NORMAL TICK
      if (timer > 3) {
        if (tickSound) tickSound.play();
      }

      // 💥 DRAMATIC MODE
      if (timer <= 3 && timer > 0) {
        shakeIntensity = 8;

        if (heartbeatSound && !heartbeatSound.isPlaying()) {
          heartbeatSound.loop();
        }
      }

      // ⏳ TIME UP
      if (timer <= 0) {
            clearInterval(timerInterval);

            if (heartbeatSound) heartbeatSound.stop();

            // ⏳ Directly load next question (no message)
            fetchQuestion();
          }

    }, 1000);

  } catch (err) {
    console.error("API Error:", err);

    currentQuestionData = {
      q: "Fallback: What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4"
    };

    createQuizButtons();
  }
}


// ================= SHOW QUIZ =================
function showQuiz() {

  background(10, 10, 30);

  if (!currentQuestionData) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(22);
    text("Loading question...", width / 2, height / 2);
    return;
  }

  // 🕒 TIMER (TOP RIGHT)
 // 🔥 INSANE PRO CIRCULAR TIMER

let cx = width - 80;
let cy = 60;
let radius = 50;

// 🎯 background ring
noFill();
stroke(50);
strokeWeight(8);
ellipse(cx, cy, radius);

// 🎯 animated progress ring
let angle = map(timer, 0, maxTime, 0, TWO_PI);

// 🔥 glowing effect
let glow = 180 + sin(frameCount * 0.1) * 75;

stroke(0, 255, 200, glow);
strokeWeight(8);
arc(cx, cy, radius, radius, -HALF_PI, -HALF_PI + angle);

// 💥 pulse when low time
if (timer <= 3) {
  let pulse = 2 + sin(frameCount * 0.3) * 2;
  stroke(255, 80, 80);
  strokeWeight(8 + pulse);
  arc(cx, cy, radius, radius, -HALF_PI, -HALF_PI + angle);
}

// 🎯 center number
noStroke();
fill(255);
textAlign(CENTER, CENTER);

// 🔥 slight scale animation
let scaleEffect = 1 + sin(frameCount * 0.2) * 0.05;
push();
translate(cx, cy);
scale(scaleEffect);
textSize(18);
text(timer, 0, 0);
pop();


  // QUESTION
  fill(255);
  textAlign(CENTER, TOP);
  textSize(26);

  text(
    currentQuestionData.q,
    width / 2 - 300,
    120,
    600,
    200
  );

  let messageY = 500;

  // WRONG MESSAGE
  if (showWrongMsg) {
    fill(255, 80, 80);
    textSize(22);
    text("❌ Wrong Answer!", width / 2, messageY);
  }

  // CORRECT MESSAGE
  if (showCorrectMsg) {
    fill(0, 255, 150);
    textSize(24);
    text("✅ Correct! Starting game...", width / 2, messageY);
  }
}


// ================= CREATE BUTTONS =================
function createQuizButtons() {

  optionButtons.forEach(btn => btn.remove());
  optionButtons = [];

  let q = currentQuestionData;
  let tempButtons = [];

  for (let i = 0; i < q.options.length; i++) {

    let btn = createButton(q.options[i]);

    let col = i % 2;
    let row = Math.floor(i / 2);

    let totalWidth = 2 * 260 + 40;
    let startX = (width - totalWidth) / 2;
    let startY = 260;

    let x = startX + col * (260 + 40);
    let y = startY + row * (80 + 40);

    btn.position(x, y);

    btn.style('padding', '12px 20px');
    btn.style('width', '260px');

    btn.style('white-space', 'normal');
    btn.style('text-align', 'center');

    btn.style('background', '#00c3ff');
    btn.style('border', 'none');
    btn.style('border-radius', '12px');
    btn.style('font-size', '17px');
    btn.style('color', '#000');

    btn.style('display', 'flex');
    btn.style('align-items', 'center');
    btn.style('justify-content', 'center');

    btn.style('box-shadow', '0 6px 15px rgba(0,0,0,0.3)');
    btn.style('transition', '0.2s ease');

    btn.mouseOver(() => {
      btn.style('transform', 'scale(1.05)');
    });

    btn.mouseOut(() => {
      btn.style('transform', 'scale(1)');
    });

    btn.mousePressed(() => {
      selectedAnswer = q.options[i];

      clearInterval(timerInterval);
      if (heartbeatSound) heartbeatSound.stop();

      highlightAnswers();
      checkAnswer();
    });

    optionButtons.push(btn);
    tempButtons.push(btn);
  }

  // equal height
  setTimeout(() => {
    let maxHeight = 0;

    tempButtons.forEach(btn => {
      let h = btn.elt.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });

    tempButtons.forEach(btn => {
      btn.style('height', maxHeight + 'px');
    });
  }, 50);
}


// ================= HIGHLIGHT ANSWERS =================
function highlightAnswers() {

  optionButtons.forEach(btn => {

    let text = btn.html();

    if (text === currentQuestionData.answer) {
      btn.style('background', '#4CAF50');
      btn.style('color', '#fff');
    }

    if (text === selectedAnswer && selectedAnswer !== currentQuestionData.answer) {
      btn.style('background', '#ff4d4d');
      btn.style('color', '#fff');
    }

    btn.attribute("disabled", true);
  });
}


// ================= CHECK ANSWER =================
function checkAnswer() {

  if (selectedAnswer === currentQuestionData.answer) {

    showCorrectMsg = true;
    showWrongMsg = false;

    setTimeout(() => {

      optionButtons.forEach(btn => btn.remove());
      optionButtons = [];

      showCorrectMsg = false;

      appState = "LOADING";
      initHandpose();

    }, 1200);

  } else {

    showWrongMsg = true;
    showCorrectMsg = false;

    setTimeout(() => {

      showWrongMsg = false;

      fetchQuestion();

    }, 1500);
  }
}