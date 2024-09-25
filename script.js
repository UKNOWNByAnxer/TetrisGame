//import './styles.css'

const audio = new Audio('./Tetris.mp3');
const audio2 = new Audio('./PouGameOver.mp3');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const $score = document.getElementById('score')
const $maxScore = document.getElementById('max-score')
const controls = document.querySelectorAll(".controls i");


const BLOCK_SIZE = 20
const BOARD_WIDTH = 14
const BOARD_HEIGHT = 30


canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

let score = 0;
let maxScore = Number(localStorage.getItem(`ScoreMax`));
localStorage.setItem('ScoreMax',`${maxScore}`);

const createBoard = (width, height) => {
    return Array(height).fill().map(() => Array(width).fill(0))
}

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

// 4. pieza player (jugador)

const piece = {
    position: { x: 5, y: 5 },
    shape: [
        [1,1],
        [1,1]
    ]
}

const PIECES = [
    [
        [1,1],
        [1,1]
    ],
    [
        [1,1,1,1]
    ],
    [
        [1,1,0],
        [0,1,1]
    ],
    [
        [0,1,1],
        [1,1,0]
    ],
    [
        [1,1,1],
        [0,1,0]
    ],
    [
        [1,1,1],
        [1,0,0]
    ],
    [
        [1,1,1],
        [0,0,1]
    ],
    [
        [1,0],
        [1,0],
        [1,1]
    ]
]

// 2. Game loop

// function update() {
//     draw();
//     window.requestAnimationFrame(update);
// }


let dropCounter = 0
let lastTime = 0

function update(time=0){
    const deltaTime = time - lastTime
    lastTime = time
    dropCounter += deltaTime

    
    if (dropCounter > 1000){
        piece.position.y++
        dropCounter = 0
        if (checkCollision()){
            piece.position.y--
            solidifyPiece()
            removeRows()
        }
    }
    draw()
    window.requestAnimationFrame(update)
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(x, y, 1, 1);
            }
        })
    })
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = 'red';
                ctx.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
            }
        })
    })
    $score.innerText = score
    $maxScore.innerText = Number(localStorage.getItem(`ScoreMax`));
}

controls.forEach(key => {
    key.addEventListener("click", () => changeDirection({key: key.dataset.key}));
})

const changeDirection = (e) => {
    if (e.key === 'ArrowUp' || e.key === `w` ) {
        const rotated = []
        for (let i = 0; i < piece.shape[0].length; i++) {
            const row = []
            for (let j = piece.shape.length - 1; j >= 0; j--) {
                row.push(piece.shape[j][i])
            }
            rotated.push(row)
        }
        const previosShape = piece.shape
        piece.shape = rotated
        if (checkCollision()) {
            piece.shape = previosShape
        }
    } 
    if (e.key === 'ArrowDown' || e.key === `s`) {
        piece.position.y ++;
        if(checkCollision()) {
            piece.position.y--;
            solidifyPiece();
            removeRows();
        }
    } 
    if (e.key === 'ArrowLeft' || e.key === `a`) {
        piece.position.x--;
        if(checkCollision()) {
            piece.position.x++;
        }
    } 
    if (e.key === 'ArrowRight' || e.key === `d`) {
        piece.position.x ++;
        if(checkCollision()) {
            piece.position.x--;
        }
    }
}


document.addEventListener('keydown', changeDirection)

function checkCollision() {
    return piece.shape.find((row, y) => {
        return row.find((value, x) => {
            return (
                value != 0 && 
                board[y + piece.position.y]?.[x + piece.position.x] != 0
            )
        })
    })
}

function solidifyPiece(){
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                board[y + piece.position.y][x + piece.position.x] = 1;
            }
        })
    })
    piece.position.x = Math.floor(Math.random() * (BOARD_WIDTH - piece.shape[0].length));
    piece.position.y = 0;
    piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];
    if (checkCollision()){
        setTimeout(()=>{
            window.alert('Game over!! Sorry!!')
            audio.play()
            score=0
        },10)
        audio.pause()
        audio2.volume=1
        audio2.play()
        board.forEach((row) => row.fill(0))
    }
}

function removeRows(){
    const rowsToRemove = []
    board.forEach((row, y) => {
        if (row.every(value => value === 1)) {
            rowsToRemove.push(y);
        }
    })
    rowsToRemove.forEach(y => {
        board.splice(y, 1);
        const newRow = new Array(BOARD_WIDTH).fill(0);
        board.unshift(newRow);
        score += 10
        if (score >= maxScore){
            maxScore = score
            localStorage.setItem('ScoreMax',`${maxScore}`)
        }
    })
}

const $section = document.querySelector('section')
const $background = document.querySelector('#background')

$section.addEventListener('click', () => {
    update()
    audio.volume = 0.8;
    audio.play();
    audio.loop = true;
    $section.remove()
    $background.remove()
})
