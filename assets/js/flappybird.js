
//  screen
let screen;
let screenWidth = window.screen.width >= 641 ? window.innerWidth / 3 : window.innerWidth;
let screenHeight = window.innerHeight;
let context;

//  bird
let birdWidth = 34; 
let birdHeight = 24;
let positionX = screenWidth/8;
let positionY = screenHeight/2;
let birdImage;

let bird = {
    x : positionX,
    y : positionY,
    width : birdWidth,
    height : birdHeight
}

//  pipe
let pipeList = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = screenWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2; 
let velocityY = 0; 
let gravity = 0.4;

let gameOver = false;
let score = 0;
let bestScore = localStorage.flappyBestScore || 0;

window.onload = function() {
    screen = document.getElementById("screen");
    screen.height = screenHeight;
    screen.width = screenWidth;
    context = screen.getContext("2d"); 

    birdImage = new Image();
    birdImage.src = "./assets/images/flappybird.png";
    birdImage.onload = function() {
        context.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./assets/images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./assets/images/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // placer les tuyaux
    document.addEventListener("keydown", moveBird);
    document.addEventListener("mousedown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, screen.width, screen.height);

    //  bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); 
    context.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > screen.height) {
        gameOver = true;
    }

    //  pipes
    for (let i = 0; i < pipeList.length; i++) {
        let pipe = pipeList[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; 
            // increment dificulty
            if(score%5 == 0) velocityX += -2;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    while (pipeList.length > 0 && pipeList[0].x < -pipeWidth) {
        pipeList.shift(); 
    }

    // affiche score
    context.fillStyle = "white";
    context.font="20px sans-serif";
    context.fillText(`Score: ${score}`, 5, 45);
    context.fillText(`Meilleur score: ${bestScore}`, 5, 70);

    if (gameOver) {
        context.fillText(`Votre score: ${score}`, screenWidth / 2.8, screenHeight / 2.5);
        context.font="45px sans-serif";
        context.fillText("GAME OVER", screenWidth / 4, screenHeight / 2);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = screen.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeList.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeList.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.which == 1) {
        velocityY = -6;

        if (gameOver) {
            if(score > bestScore) {
                bestScore = score
                localStorage.flappyBestScore = score
            }
            // reset game
            bird.y = positionY;
            pipeList = [];
            velocityX = -2;
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&  
           a.x + a.width > b.x && 
           a.y < b.y + b.height && 
           a.y + a.height > b.y;
}