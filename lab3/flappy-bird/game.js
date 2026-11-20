const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = 288;
const CANVAS_HEIGHT = 512;
const GROUND_Y = 400;

const STATES = {
  START: "START",
  PLAYING: "PLAYING",
  FALLING: "FALLING",
  CELEBRATING: "CELEBRATING",
  GAMEOVER: "GAMEOVER",
};

let gameState = STATES.START;

const images = {
  bg: new Image(),
  base: new Image(),
  pipe: new Image(),
  birdDown: new Image(),
  birdMid: new Image(),
  birdUp: new Image(),
  message: new Image(),
  gameover: new Image(),
  numbers: [],
};

images.bg.src = "assets/sprites/background-day.png";
images.base.src = "assets/sprites/base.png";
images.pipe.src = "assets/sprites/pipe-green.png";
images.birdDown.src = "assets/sprites/yellowbird-downflap.png";
images.birdMid.src = "assets/sprites/yellowbird-midflap.png";
images.birdUp.src = "assets/sprites/yellowbird-upflap.png";
images.message.src = "assets/UI/message.png";
images.gameover.src = "assets/UI/gameover.png";

for (let i = 0; i <= 9; i++) {
  const numImg = new Image();
  numImg.src = `assets/UI/Numbers/${i}.png`;
  images.numbers.push(numImg);
}

const sounds = {
  wing: new Audio("assets/audio/wing.wav"),
  hit: new Audio("assets/audio/hit.wav"),
  die: new Audio("assets/audio/die.wav"),
  point: new Audio("assets/audio/point.wav"),
  swoosh: new Audio("assets/audio/swoosh.wav"),
};

function playSound(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

let audioCtx = null;
let musicInterval = null;

function startMusic() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  stopMusic();

  const melody = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 392.0, 329.63];
  let noteIndex = 0;

  musicInterval = setInterval(() => {
    if (gameState !== STATES.PLAYING) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = melody[noteIndex % melody.length];
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 0.18,
      );
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
      noteIndex++;
    } catch (e) {}
  }, 220);
}

function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

let score = 0;
let lastScore = parseInt(localStorage.getItem("flappy_lastScore"), 10) || 0;
let top5 = JSON.parse(localStorage.getItem("flappy_top5")) || [];
let previousRecord = top5.length > 0 ? top5[0] : 0;
let isNewRecord = false;

let frameCount = 0;
let baseX = 0;
const BASE_SPEED = 2;

const bird = {
  x: 60,
  y: 200,
  width: 34,
  height: 24,
  vy: 0,
  gravity: 0.26,
  jump: -5.0,
  rotation: 0,
  animFrame: 0,
};

let pipes = [];
const PIPE_WIDTH = 52;
const PIPE_HEIGHT = 320;
const PIPE_GAP = 105;
const PIPE_INTERVAL = 95;

let boost = null;
let ghostTimer = 0;
let celebrationTimer = 0;

function resetGame() {
  score = 0;
  bird.x = 60;
  bird.y = 200;
  bird.vy = 0;
  bird.rotation = 0;
  bird.animFrame = 0;
  pipes = [];
  boost = null;
  ghostTimer = 0;
  celebrationTimer = 0;
  isNewRecord = false;
  gameState = STATES.START;
  stopMusic();
}

function flap() {
  if (gameState === STATES.START) {
    gameState = STATES.PLAYING;
    startMusic();
    bird.vy = bird.jump;
    playSound(sounds.wing);
  } else if (gameState === STATES.PLAYING) {
    bird.vy = bird.jump;
    playSound(sounds.wing);
  } else if (gameState === STATES.GAMEOVER) {
    resetGame();
  }
}

function spawnPipe() {
  const minTop = 40;
  const maxTop = GROUND_Y - PIPE_GAP - 40;
  const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

  pipes.push({
    x: CANVAS_WIDTH,
    topHeight: topHeight,
    bottomY: topHeight + PIPE_GAP,
    passed: false,
  });

  if (!boost && Math.random() < 0.35 && pipes.length > 2) {
    boost = {
      x: CANVAS_WIDTH + PIPE_WIDTH / 2 - 8,
      y: topHeight + PIPE_GAP / 2 - 8,
      size: 16,
      collected: false,
    };
  }
}

function saveScore(finalScore) {
  lastScore = finalScore;
  localStorage.setItem("flappy_lastScore", finalScore.toString());

  top5.push(finalScore);
  top5.sort((a, b) => b - a);
  top5 = top5.slice(0, 5);
  localStorage.setItem("flappy_top5", JSON.stringify(top5));
}

function update() {
  frameCount++;

  if (gameState === STATES.START) {
    baseX = (baseX - BASE_SPEED) % 48;
    bird.y = 200 + Math.sin(frameCount * 0.1) * 6;
    bird.animFrame = Math.floor(frameCount / 6) % 3;
    bird.rotation = 0;
    return;
  }

  if (gameState === STATES.PLAYING) {
    baseX = (baseX - BASE_SPEED) % 48;

    bird.vy += bird.gravity;
    bird.y += bird.vy;

    if (bird.vy < 0) {
      bird.rotation = -0.35;
    } else {
      bird.rotation = Math.min(Math.PI / 2, bird.rotation + 0.05);
    }

    bird.animFrame = Math.floor(frameCount / 6) % 3;

    if (ghostTimer > 0) {
      ghostTimer--;
    }

    if (frameCount % PIPE_INTERVAL === 0) {
      spawnPipe();
    }

    for (let i = 0; i < pipes.length; i++) {
      const p = pipes[i];
      p.x -= BASE_SPEED;

      if (!p.passed && bird.x > p.x + PIPE_WIDTH) {
        score++;
        p.passed = true;
        playSound(sounds.point);
      }

      if (ghostTimer === 0) {
        const inPipeX =
          bird.x + bird.width > p.x + 4 && bird.x < p.x + PIPE_WIDTH - 4;
        const hitTop = bird.y < p.topHeight;
        const hitBottom = bird.y + bird.height > p.bottomY;

        if (inPipeX && (hitTop || hitBottom)) {
          triggerCrash();
          return;
        }
      }
    }

    if (pipes.length > 0 && pipes[0].x + PIPE_WIDTH < -10) {
      pipes.shift();
    }

    if (boost && !boost.collected) {
      boost.x -= BASE_SPEED;

      const collX =
        bird.x + bird.width > boost.x && bird.x < boost.x + boost.size;
      const collY =
        bird.y + bird.height > boost.y && bird.y < boost.y + boost.size;

      if (collX && collY) {
        boost.collected = true;
        ghostTimer = 300;
        playSound(sounds.swoosh);
      }

      if (boost.x < -20) {
        boost = null;
      }
    }

    if (bird.y + bird.height >= GROUND_Y) {
      bird.y = GROUND_Y - bird.height;
      triggerGroundHit();
      return;
    }

    if (bird.y < 0) {
      bird.y = 0;
      bird.vy = 0;
    }
  }

  if (gameState === STATES.FALLING) {
    bird.vy += bird.gravity * 1.5;
    bird.y += bird.vy;
    bird.rotation = Math.PI / 2;

    if (bird.y + bird.height >= GROUND_Y) {
      bird.y = GROUND_Y - bird.height;
      triggerGroundHit();
    }
  }

  if (gameState === STATES.CELEBRATING) {
    bird.rotation += 0.2;
    celebrationTimer--;
    if (celebrationTimer <= 0) {
      gameState = STATES.GAMEOVER;
    }
  }
}

function triggerCrash() {
  stopMusic();
  playSound(sounds.hit);
  gameState = STATES.FALLING;
  bird.vy = 2;
}

function triggerGroundHit() {
  stopMusic();
  playSound(sounds.die);

  if (score > previousRecord && score > 0) {
    isNewRecord = true;
    previousRecord = score;
    saveScore(score);
    gameState = STATES.CELEBRATING;
    celebrationTimer = 180;
  } else {
    saveScore(score);
    gameState = STATES.GAMEOVER;
  }
}

function drawBirdSprite() {
  const birdSprites = [images.birdDown, images.birdMid, images.birdUp];
  const sprite = birdSprites[bird.animFrame] || images.birdMid;

  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(bird.rotation);

  if (ghostTimer > 0) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ffd700";
    if (Math.floor(frameCount / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
  }

  ctx.drawImage(
    sprite,
    -bird.width / 2,
    -bird.height / 2,
    bird.width,
    bird.height,
  );
  ctx.restore();
}

function drawScoreTopRight() {
  const scoreStr = score.toString();
  let totalWidth = 0;
  for (let ch of scoreStr) {
    const numImg = images.numbers[parseInt(ch, 10)];
    totalWidth += numImg && numImg.width ? numImg.width : 24;
  }

  let startX = CANVAS_WIDTH - totalWidth - 16;
  let startY = 16;

  for (let ch of scoreStr) {
    const numImg = images.numbers[parseInt(ch, 10)];
    if (numImg && numImg.complete && numImg.naturalWidth !== 0) {
      ctx.drawImage(numImg, startX, startY);
      startX += numImg.width;
    } else {
      ctx.font = "bold 24px monospace";
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeText(ch, startX, startY + 24);
      ctx.fillText(ch, startX, startY + 24);
      startX += 16;
    }
  }
}

function draw() {
  ctx.drawImage(images.bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];

    ctx.save();
    if (ghostTimer > 0) {
      ctx.globalAlpha = 0.35;
    }

    ctx.save();
    ctx.translate(p.x, p.topHeight);
    ctx.scale(1, -1);
    ctx.drawImage(images.pipe, 0, 0, PIPE_WIDTH, PIPE_HEIGHT);
    ctx.restore();

    ctx.drawImage(images.pipe, p.x, p.bottomY, PIPE_WIDTH, PIPE_HEIGHT);
    ctx.restore();
  }

  if (boost && !boost.collected) {
    ctx.save();
    ctx.fillStyle = "#ffd700";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      boost.x + boost.size / 2,
      boost.y + boost.size / 2,
      boost.size / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("★", boost.x + boost.size / 2, boost.y + boost.size / 2 + 3.5);
    ctx.restore();
  }

  ctx.drawImage(images.base, baseX, GROUND_Y, 336, 112);

  drawBirdSprite();

  drawScoreTopRight();

  if (gameState === STATES.START) {
    const msgW = 184;
    const msgH = 267;
    const msgX = (CANVAS_WIDTH - msgW) / 2;
    const msgY = 80;
    ctx.drawImage(images.message, msgX, msgY, msgW, msgH);
  }

  if (gameState === STATES.CELEBRATING) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 22px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#000";
    ctx.fillText("NOWY REKORD!", CANVAS_WIDTH / 2, 140);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'Segoe UI', sans-serif";
    ctx.fillText("Gratulacje!", CANVAS_WIDTH / 2, 175);
    ctx.restore();
  }

  if (gameState === STATES.GAMEOVER) {
    const goW = 192;
    const goH = 42;
    const goX = (CANVAS_WIDTH - goW) / 2;
    const goY = 45;
    ctx.drawImage(images.gameover, goX, goY, goW, goH);

    const boardX = 24;
    const boardY = 100;
    const boardW = 240;
    const boardH = 270;

    ctx.save();
    ctx.fillStyle = "#ded895";
    ctx.strokeStyle = "#543847";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e86100";
    ctx.font = "bold 14px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TABLICA WYNIKÓW", CANVAS_WIDTH / 2, boardY + 25);

    ctx.textAlign = "left";
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#543847";
    ctx.fillText(`Twój wynik: ${score}`, boardX + 20, boardY + 52);
    ctx.fillText(`Poprzednia gra: ${lastScore}`, boardX + 20, boardY + 72);
    ctx.fillText(
      `Najlepszy wynik: ${top5[0] || score}`,
      boardX + 20,
      boardY + 92,
    );

    ctx.strokeStyle = "#c3bc74";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(boardX + 15, boardY + 105);
    ctx.lineTo(boardX + boardW - 15, boardY + 105);
    ctx.stroke();

    ctx.fillStyle = "#e86100";
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.fillText("Top 5 najlepszych:", boardX + 20, boardY + 125);

    ctx.font = "12px 'Segoe UI', monospace";
    ctx.fillStyle = "#333";
    for (let i = 0; i < 5; i++) {
      const val = top5[i] !== undefined ? top5[i] : "-";
      ctx.fillText(
        `${i + 1}. miejsce:  ${val}`,
        boardX + 30,
        boardY + 148 + i * 20,
      );
    }

    const btnX = 49;
    const btnY = 390;
    const btnW = 190;
    const btnH = 40;

    ctx.fillStyle = "#e86100";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ZAGRAJ PONOWNIE", CANVAS_WIDTH / 2, btnY + 25);
    ctx.restore();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    flap();
  }
});

canvas.addEventListener("click", (e) => {
  if (gameState === STATES.GAMEOVER) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const btnX = 49;
    const btnY = 390;
    const btnW = 190;
    const btnH = 40;

    if (
      clickX >= btnX &&
      clickX <= btnX + btnW &&
      clickY >= btnY &&
      clickY <= btnY + btnH
    ) {
      resetGame();
      return;
    }
  }
  flap();
});

resetGame();
gameLoop();
