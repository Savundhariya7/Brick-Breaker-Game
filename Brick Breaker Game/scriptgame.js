 

 let board;
 let context;
 let boardHeight = 700;
 let boardWidth = 1500;

//paddle

let playerWidth = 86;
let playerHeight = 13;
let playerVelocity = 10;  // change position over time and paddle moves left and right as it moves only in x axis
let playerVelocityX = 10;



let player = {
      x : boardWidth/2 - playerWidth/2,    // paddle  width        // this is player object
      y :  boardHeight - playerHeight - 5,  // paddle height
      width : playerWidth,
      height : playerHeight,
      velocityX : playerVelocityX
}


// Create the ball 

let ballWidth = 15;
let ballHeight = 15;
let ballVelocityX = 3;
let ballVelocityY = 3;


let  ball ={
  x : boardWidth/2,
  y : boardHeight/2,
  width : ballWidth,
  height : ballHeight,
  velocityX : ballVelocityX,
  velocityY : ballVelocityY
}

// bricks 
let  brickArray = [];
let brickWidth = 60;
let brickHeight = 10;
let brickColumns = 21;
let brickRows = 5;    // add more as game goes on
let brickMaxRows = 10;   // limit how many rows
let brickCount = 0;


//starting block corner to left
let brickX = 15;
let brickY = 45; 

// score
let score = 0;
let lives = 3;
let gameOver = false;

 // on page loads we call our function

 window.onload = function()
 {
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width =  boardWidth;
    context = board.getContext('2d');  // used for drawing in the canvas board
  
 
    //  context.strokeStyle = 'skyblue';
    //  context.strokeRect(player.x, player.y, player.width, player.height);

 requestAnimationFrame(update); // method to repaint the canvas like loop
 document.addEventListener("keydown",movePlayer)   //click a key ,it goes down and can also holde the key by pressing it
 document.addEventListener("mousemove",movePlayerWithMouse);  // mouse movement 
 document.addEventListener("mousedown", startGame);      // Add event listener for mouse click or tap

  // create brick
     createBricks();
  
  // Initial rendering
     drawPlayer();
     requestAnimationFrame(update);  
     resetBall();
}

  // Function to draw the player paddle
function drawPlayer() 
{
  context.fillStyle = 'aqua'; // Set the fill style for the player paddle
  context.fillRect(player.x, player.y, player.width, player.height);
}


function startGame(e) {
  if (gameOver) {
    if (e.type === "mousedown" || (e.type === "keydown" && e.code === "Space")) {
      resetGame();
    }
  } else {
    // Start the ball movement on mouse click or tap only when the ball is at rest
    if (e.type === "mousedown") {
      if (ball.velocityX === 0 && ball.velocityY === 0) {
        // Set the ball position at the center of the paddle
        ball.x = player.x + player.width / 2 - ball.width / 2;
        ball.y = boardHeight - player.height - ball.height - 5;
        ball.velocityX = 2;  
        ball.velocityY = -2;
      }
    }
  }
}

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);
  context.fillStyle = "aqua";
  context.fillRect(player.x, player.y, player.width, player.height);

  // Check if the ball is at rest
  if (ball.velocityX === 0 && ball.velocityY === 0) 
  {
    // Update the ball position based on the player's position
    ball.x = player.x + player.width / 2 - ball.width / 2;
    ball.y = boardHeight - player.height - ball.height - 5;
  } 
  else {
    // Move the ball if it's not at rest
    ball.x += ball.velocityX;   
    ball.y += ball.velocityY;   
  }

       

      // ball
      context.fillStyle = "white";
      

     // draw ball 
          context.beginPath();
          context.arc(ball.x + ball.width/2, ball.y + ball.height/2, ball.width / 2, 0, Math.PI * 2);
          context.fill();
          context.closePath();

     // bounce ball off walls 

     if(ball.y <= 0)
        {
          ball.velocityY *= -1;    // ball touches top of board
        }
     else if(ball.x <= 0 || (ball.x + ball.width) >= boardWidth) 
       {
         ball.velocityX *= -1;    // ball touches left or right of board  // -1 indicate reverse direction
       }
       else if (ball.y + ball.height >= boardHeight) 
       {
             lives--;
    
        if (lives > 0) 
        {
          resetBall();
        }
     else 
       {
           context.font = "22px sans-serif"; // the ball touches the bottom game over
           context.fillText("Game Over : Press 'Space' to Restart",80,400);
           gameOver = true;
           return;
          }
        }
      


       // bouncing the ball of paddle

      if(topCollision(ball,player)|| bottomCollision(ball,player))
      {
        ball.velocityY *= -1;  // flip y direction up or down
      }
      else if(leftCollision(ball,player) || rightCollision(ball,player))
      {
         ball.velocityX *= -1;   // flip x direction up or down
      }

      // blocks 
      context.fillStyle = " plum ";
      for(let i=0;i < brickArray.length; i++)
      {
        let brick = brickArray[i];
        if(!brick.break){
            if(topCollision(ball,brick)|| bottomCollision(ball,brick))
            {
                brick.break = true;
                ball.velocityY *= -1  // flip y direction up or down
                brickCount -= 1;
                score +=10;
              }
              else if(leftCollision(ball,brick)|| rightCollision(ball,brick))
              {
                brick.break=true;
                ball.velocityX *= 1;  //flip x direction left or right
                brickCount -= 1;
                score +=10;
              }
            context .fillRect(brick.x,brick.y,brick.width,brick.height);
        }
      }

      // next level
       if(brickCount == 0)
       {
        score += 100*brickRows*brickColumns;
        brickRows = Math.min(brickRows + 1,brickMaxRows);
        createBricks();
       }

      //score
        
        context.font = "20px sans-serif";
        context.fillText("Score : " + score, 10, 25);
        context.fillText("Lives :" + lives, boardWidth - 90, 25);
      }
 

 function movePlayer(e){       // e is for the key event
       
        if (gameOver)
        {
           if(e.code == "Space")
           {
            resetGame();
           }
        }
       if(e.code == "ArrowLeft" && player.x > 0)
       {                                         // if the (x,y) =(0,500) , then if we have to move left or up , subtract from x in player object and  playervelocityX
        player.x -= player.velocityX;            //  if  we have to move right or down , we  have to add the x from player object and the playervelocityX 
       }
       else if(e.code == "ArrowRight" && player.x + player.width <board.width)
       {
        player.x += player.velocityX;        
       }
       
 }

 function movePlayerWithMouse(e){

  //player position based on the mouse pointer
  let mouseX = e.clientX - board.offsetLeft;
  let newPlayerX = mouseX - player.width/2;
  
  // paddle stays within the board
    if(newPlayerX >= 0 && newPlayerX + player.width <= boardWidth)
       {
          player.x = newPlayerX;
          context.clearRect(0, 0, board.width, board.height);
          drawPlayer();
       }
 }

 function detectCollision(a,b){
         return a.x < b.x + b.width &&    //a's top corner doesn't reach b's top right corner
                a.x + a.width > b.x &&    // a's top right corner passes b's top left corner
                a.y < b.y + b.height &&   // a's top left corner doesn't reach b's bottom left corner
                a.y + a.height > b.y;    // a's bottom left corner passes b's top left corner
 
              }   

 function topCollision(ball, block) 
    {
        return ( detectCollision(ball, block) && ball.y < block.y + block.height && ball.y + ball.height >= block.y);
    }
              
 function bottomCollision(ball, block)
    {
         return (detectCollision(ball, block) && ball.y + ball.height > block.y && ball.y <= block.y + block.height);
    }
              

 function leftCollision(ball,block)       // ball is left of block
    {
        return detectCollision(ball,block) && (ball.x + ball.width) >= ball.x;
    }

 function rightCollision(ball,block)    // ball is right of block
    {
        return detectCollision(ball,block) && (block.x + block.width) >= ball.x;
    }

// create blocks

function createBricks(){
    brickArray = [];
    for(let c = 0; c < brickColumns;c++)
    {
      for(let r = 0; r < brickRows; r++)
      {
        let brick =
        {
          x : brickX + c*brickWidth + c*10,  //space 10px apart columns
          y : brickY + r*brickHeight + r*10,  // space 10px apart rows
          width : brickWidth,
          height : brickHeight,
          break : false
        }
        brickArray.push(brick);
      }
    }
    brickCount = brickArray.length;
}

function resetGame(){
      gameOver = false;
      lives = 3;
      player = {
        x : boardWidth/2 - playerWidth/2,    // paddle  width   
        y :  boardHeight - playerHeight - 5,  // paddle height
        width : playerWidth,
        height : playerHeight,
        velocityX : playerVelocityX
  }
   resetBall();
  brickArray=[];
  brickRows=3;
  score = 0;
  createBricks();
  
}

function resetBall() {
  ball = {
    x: player.x + player.width / 2 - ballWidth / 2,
    y: boardHeight - player.height - ballHeight - 5,
    width: ballWidth,
    height: ballHeight,
    velocityX: 0,
    velocityY: 0
  };
}








