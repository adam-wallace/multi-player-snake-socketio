const BG_COLOUR = '#231f20'
const SNAKE_COLOUR_ONE = '#c2c2c2'
const SNAKE_COLOUR_TWO = 'red'
const FOOD_COLOUR = '#e66916'

// socket io pulled in by html tag
const socket = io('http://localhost:3000')
socket.on('init', handleInit)
// send and repaint new gamestate when state changes on server
socket.on('gameState', handleGameState)
socket.on('gameOver', handleGameOver)
socket.on('gameCode', handleGameCode)
socket.on('unknownGame', handleUnknownGame)
socket.on('tooManyPlayers', handleTooManyPlayers)

const gameScreen = document.getElementById('gameScreen')
const initialScreen = document.getElementById('initialScreen')
const newGameButton = document.getElementById('newGameButton')
const joinGameButton = document.getElementById('joinGameButton')
const gameCodeInput = document.getElementById('gameCodeInput')
const gameCodeDisplay = document.getElementById('gameCodeDisplay')

newGameButton.addEventListener('click', newGame)
joinGameButton.addEventListener('click', joinGame)

function newGame () {
  socket.emit('newGame')
}

function joinGame () {
  const code = gameCodeInput.value
  console.log(code)
  socket.emit('joinGame', code)
  init()
}

let canvas, ctx
let playerNumber
let gameActive = false

function init () {
  initialScreen.style.display = 'none'
  gameScreen.style.display = 'block'
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')

  canvas.width = canvas.height = 600
  ctx.fillStyle = BG_COLOUR
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  document.addEventListener('keydown', keydown)
  gameActive = true
}

function keydown (event) {
  // send key to server
  socket.emit('keydown', event.keyCode)
}

function paintGame (state) {
  ctx.fillStyle = BG_COLOUR
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const food = state.food
  const gridSize = state.gridSize // how many cells in grid
  const cellSize = canvas.width / gridSize // pixels per cell/square

  // place food
  ctx.fillStyle = FOOD_COLOUR
  ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize)

  paintPlayer(state.players[0], cellSize, SNAKE_COLOUR_ONE)
  paintPlayer(state.players[1], cellSize, SNAKE_COLOUR_TWO)
}

function paintPlayer (playerState, cellSize, colour) {
  const snake = playerState.snake
  // paint each snake cell
  ctx.fillStyle = colour
  for (const cell of snake) {
    ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize)
  }
}

function handleInit (number) {
  playerNumber = number
  init()
}

function handleGameState (gameState) {
  // check the game is active before we do anything
  if (!gameActive) {
    return
  }
  gameState = JSON.parse(gameState)
  window.requestAnimationFrame(() => paintGame(gameState))
}

function handleGameOver (data) {
  // check the game is active before we do anything
  if (!gameActive) {
    return
  }
  data = JSON.parse(data)
  if (data.winner === playerNumber) { // playerNumber set in browser when handleInit() runs
    alert('YOU WIN!')
  } else {
    alert('YOU LOSE')
  }
  gameActive = false
}

function handleGameCode (gameCode) {
  gameCodeDisplay.innerText = gameCode
}

function handleUnknownGame () {
  reset()
  alert('Unknown gamecode')
}

function handleTooManyPlayers () {
  reset()
  alert('This game is already in progress')
}

function reset () {
  playerNumber = null
  gameCodeInput.value = ''
  gameCodeDisplay.innerText = ''
  initialScreen.style.display = 'block'
  gameScreen.style.display = 'none'
}
