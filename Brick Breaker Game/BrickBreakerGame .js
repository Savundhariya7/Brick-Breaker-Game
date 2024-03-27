const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ball properties
const ballRadius = 10;
let ballX;
let ballY;
let ballSpeedX = 2;
let ballSpeedY = -2;
let ballInPlay = false;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Keyboard input
let rightPressed = false;
let leftPressed = false;

// Brick properties
const brickRowCount = 9;
const brickColumnCount = 19;
const brickWidth = 65;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 28;
const brickOffsetRight = 29;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// Score and lives
let score = 0;
let lives = 3; //limit to 3 lives
let matchCount = 3; 


// Event listeners
document.addEventListener("mousemove", mouseMoveHandler);
document.addEventListener("mousedown", mouseDownHandler);
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Function to handle mouse movement
function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
    if (!ballInPlay) {
      // If the ball is not in play, update its position with the paddle
      ballX = paddleX + paddleWidth / 2;
      ballY = canvas.height - paddleHeight - ballRadius;
    }
  }
}

// Function to handle mouse click
function mouseDownHandler() {
  if (!ballInPlay && lives > 0) {
    // Start the ball when the mouse is clicked
    ballInPlay = true;
    ballSpeedY = -2; // Set the initial speed
  }
}

// Functions to handle keyboard input
function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// Function to draw the ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FF5733"; // Change color for the ball
  ctx.fill();
  ctx.closePath();
}

// Function to draw the paddle
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#38cfc8"; // Change  color for the paddle
  ctx.fill();
  ctx.closePath();
}

// Function to draw the bricks
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#490449"; // Change to your desired color for the bricks
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// Function to detect collisions with bricks
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight
        ) {
          ballSpeedY = -ballSpeedY;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            matchCount++;
            if (matchCount === 3) {
              endGame();
            } else {
              nextMatch();
            }
          }
        }
      }
    }
  }
}

// Function to draw the score
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#FF5733"; // Change to your desired color for the score
  
  ctx.fillText("Score: " + score, 8, 20);
}

// Function to draw lives
function drawLives() {
  ctx.font = "18px Arial";
  ctx.fillStyle = "#FF5733"; // Change to your desired color for lives
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

// Function to update the game state
function update() {
  // Move the ball
  if (ballInPlay) {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
  }

  // Bounce the ball off the walls
  if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
    ballSpeedX = -ballSpeedX;
  }
  if (ballY + ballSpeedY < ballRadius) {
    ballSpeedY = -ballSpeedY;
  } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
    // Check if the ball hit the paddle
    if (
      ballX > paddleX &&
      ballX < paddleX + paddleWidth &&
      ballY + ballRadius >= canvas.height - paddleHeight
    ) {
      ballSpeedY = -ballSpeedY;
    } else {
      // Lose a life
      lives--;
      if (lives === 0) {
        if (score > topScore) {
          topScore = score;
        }
        matchCount++;
        if (matchCount === 3) {
          endGame();
        } else {
          nextMatch();
        }
      } else {
        // Reset ball position to the resting stage
        ballInPlay = false;
        ballX = paddleX + paddleWidth / 2;
        ballY = canvas.height - paddleHeight - ballRadius;
      }
    }
  }

  // Detect collisions with bricks
  collisionDetection();
}

// Function to draw everything
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the ball, paddle, bricks, score, and lives
  drawBall();
  drawPaddle();
  drawBricks();
  drawScore();
  drawLives();

  // Update the game state
  update();

  // Repeat the draw function
  requestAnimationFrame(draw);
}

// Function to start a new match
function nextMatch() {
  score = 0;
  ballInPlay = false;
  ballX = paddleX + paddleWidth / 2;
  ballY = canvas.height - paddleHeight - ballRadius;
  draw();
}

// Function to end the game
function endGame() {
  alert("Game Over! Your top score is: " + topScore);
  localStorage.setItem("topScore", topScore);
  // Display all past scores
  const pastScores = JSON.parse(localStorage.getItem("pastScores")) || [];
  pastScores.push(topScore);
  localStorage.setItem("pastScores", JSON.stringify(pastScores));
  // Reset the game state
  score = 0;
  lives = 3;
  matchCount = 0;
  topScore = 0;
  nextMatch();
}

// Start the game
draw();
