const { GRID_SIZE } = require('./constants')

function initGame () {
  const state = createGameState()
  randomFood(state)
  return state
}

function createGameState () {
  return {
    players: [{
      pos: {
        x: 3,
        y: 10
      },
      vel: {
        x: 1,
        y: 0
      },
      snake: [
        { x: 1, y: 10 },
        { x: 2, y: 10 },
        { x: 3, y: 10 }
      ]
    },
    {
      pos: {
        x: 1,
        y: 3
      },
      vel: {
        x: 0,
        y: 1
      },
      snake: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 }
      ]
    }],
    food: {
      // assigned in init()
    },
    gridSize: GRID_SIZE
  }
}

function gameLoop (state) {
  // defensive guard
  if (!state) {
    return
  }

  const playerOne = state.players[0]
  const playerTwo = state.players[1]

  // is the snake moving?
  // move snake head position
  if (playerOne.vel.x || playerOne.vel.y) {
    playerOne.pos.x += playerOne.vel.x
    playerOne.pos.y += playerOne.vel.y

    // has the snake bumped into itself?
    for (const cell of playerOne.snake) {
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2 // player 1 loses, player 2 wins the game
      }
    }
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    playerTwo.pos.x += playerTwo.vel.x
    playerTwo.pos.y += playerTwo.vel.y

    // has the snake bumped into itself?
    for (const cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1 // player 2 loses, player 1 wins the game
      }
    }
  }

  // has a snake hit a wall?
  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
    return 2 // player 1 loses, player 2 wins the game
  }
  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    return 1 // player 2 loses, player 1 wins the game
  }

  // adjust the snakes body segments
  // has player eaten food?
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos }) // add one new cell (the new position cell) to the body object to snake array
    // place new food
    randomFood(state)
  } else {
    playerOne.snake.push({ ...playerOne.pos })
    playerOne.snake.shift()
  }

  // has player eaten food?
  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos }) // add one new cell (the new position cell) to the body object to snake array
    // place new food
    randomFood(state)
  } else {
    playerTwo.snake.push({ ...playerTwo.pos })
    playerTwo.snake.shift()
  }

  return false // no winner
}

function randomFood (state) {
  const food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  }

  for (const cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      randomFood() // recursively call randomFood until the food is not on the snake
    }
  }

  for (const cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      randomFood() // recursively call randomFood until the food is not on the snake
    }
  }
  state.food = food
}

function getUpdatedVelocity (keyCode) {
  const left = { x: -1, y: 0 }
  const right = { x: 1, y: 0 }
  const downward = { x: 0, y: 1 }
  const upward = { x: 0, y: -1 }
  console.log(keyCode)
  switch (keyCode) {
    case 37:
      return {
        vel: left,
        opposingVel: right
      }

    case 38:
      return {
        vel: upward,
        opposingVel: downward
      }

    case 39:
      return {
        vel: right,
        opposingVel: left
      }

    case 40:
      return {
        vel: downward,
        opposingVel: upward
      }
    default:
      return null
  }
}

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity
}
