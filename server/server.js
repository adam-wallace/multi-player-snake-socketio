
// socket io
const io = require('socket.io')({
  cors: {
    origin: '*'
  }
})

const { initGame, gameLoop, getUpdatedVelocity } = require('./game')
const { makeid } = require('./utils')
const { FRAME_RATE } = require('./constants')

// global state object for all rooms
const state = {}
// lookup table for room name of a particular user id
// socket io gives us an id on the client object
const clientRooms = {}

// client object allows us to communicate back to client that has just connected
// send the client back an object with 'init' event
// client.emit('init', { data: 'hello world' })
io.on('connection', client => {
  client.on('keydown', handleKeydown)
  client.on('newGame', handleNewGame)
  client.on('joinGame', handleJoinGame)

  function handleNewGame () {
    // unique name for room
    let roomName = makeid(5)
    // console.log('roomName:', roomName)

    // map client id (created by socket io) to room name (created by server) to keep track of clients in rooms
    clientRooms[client.id] = roomName

    client.emit('gameCode', roomName)

    // store server game state for room
    state[roomName] = initGame()

    // add roomName/gameCode to the socketio rooms
    client.join(roomName)

    // player one
    client.number = 1
    // send back player number
    client.emit('init', 1)
  }

  function handleJoinGame (roomName) {
    // gameCode === roomName

    // game must exist and player must be waiting to play
    const room = io.sockets.adapter.rooms.get(roomName)

    // get users in room (from set)
    const numClients = room ? room.size : 0

    if (numClients === 0) {
      client.emit('unknownGame')
      return
    } else if (numClients > 1) {
      client.emit('tooManyPlayers')
      return
    }

    clientRooms[client.id] = roomName

    // join the already created socketio room (with one player already present)
    client.join(roomName)
    // second player to join the room
    client.number = 2
    client.emit('init', 2)

    // only start the game once the second player has joined
    startGameInterval(roomName)
    // we can get all the clients just using the room name
    // we can emit to all clients in a socketio room
  }

  function handleKeydown (keyCode) {
    const roomName = clientRooms[client.id]
    if (!roomName) {
      // random player outside of a room/game
      return
    }
    // console.log(keyCode)
    try {
      keyCode = parseInt(keyCode)
    } catch (err) {
      console.log(err)
      return
    }
    console.log(keyCode)

    const vel = getUpdatedVelocity(keyCode)

    // make sure its a velocity and
    // if the opposing velocity of the input velocity is equal to the current velocity then this should
    // be ignored as the snake cannot go back on itself
    const playerState = state[roomName].players[client.number - 1] // use client.number (set on init) to access either player one or two in the state array for the room
    if (vel && vel.vel && vel.opposingVel.x === playerState.vel.x && vel.opposingVel.y === playerState.vel.y) {
      console.log('snake cannot move in that direction')
    } else if (vel) {
      playerState.vel = vel.vel
    }
  }
})

function startGameInterval (roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName])

    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner)
      state[roomName] = null
      clearInterval(intervalId)
    }
  }, 1000 / FRAME_RATE // 1000ms(1 second)/frames per second (milliseconds to wait per frame). send updates to client
  )
}

function emitGameState (roomName, state) {
  // emit to all clients in room name
  io.sockets.in(roomName)
    .emit('gameState', JSON.stringify(state))
}

function emitGameOver (roomName, winner) {
  // emit to all clients in room name
  io.sockets.in(roomName)
    .emit('gameOver', JSON.stringify({ winner }))
}

io.listen(3000)
