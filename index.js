const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
  console.log("db connected!");
});

app.use(express.static("public", { index: false }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const {
  _getPlayersList,
  _isFullPlayer,
  _hasThisPlayer,
  _setPlayerInFirstEmptySlot,
  _removeThisPlayer,
  _setRoomOwner,
} = require("./temporaryDatabase");

const usersRoute = require("./modules/users/users.route");

app.get("/mainplay", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/getPlayersList", (req, res) => {
  res.send({ success: true, data: _getPlayersList() });
});

app.use("/api/users", usersRoute);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("server started!", process.env.PORT || 3000);
});

// socket io part

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
  allowEIO3: true,
});

io.sockets.on("connection", (socket) => {
  const isFullPlayer = _isFullPlayer();
  if (isFullPlayer) {
    socket.emit("fullSlots");
    socket.disconnect(true);
    return;
  }

  socket.on("joinRoom", (incomingPlayer) => {
    // check if this user is already in
    const hasThisPlayer = _hasThisPlayer(incomingPlayer.userName);
    // console.log(_getPlayersList());
    if (hasThisPlayer) {
      socket.emit("duplicateConnection");
      socket.disconnect(true);
      return;
    }

    // add this player to the room
    const newPlayer = _setPlayerInFirstEmptySlot({
      ...incomingPlayer,
      socketId: socket.id,
    });

    _setRoomOwner();
    console.log(_getPlayersList());

    socket.emit("joinRoom", {
      playersList: _getPlayersList(),
      me: newPlayer,
    });

    socket.broadcast.emit("newPlayerEnter", {
      playersList: _getPlayersList(),
      newPlayer,
    });
  });

  // waiting-room event
  socket.on("toggleReadyState", ({ isReady }) => {
    const foundPlayer = _getPlayersList().find((g) => g.socketId === socket.id);
    foundPlayer.isReady = isReady;
    io.emit("toggleReadyState", {
      playersList: _getPlayersList(),
    });
  });

  socket.on("startGame", () => {
    io.emit("startGame");
  });

  // mainplay event
  socket.on("diceHandler", (data) => {
    io.emit("diceHandler", data);
  });
  socket.on("homeHandler", (data) => {
    io.emit("homeHandler", data);
  });
  socket.on("pathHandler", (data) => {
    io.emit("pathHandler", data);
  });
  socket.on("finishHandler", (data) => {
    io.emit("finishHandler", data);
  });
  socket.on("skipBtnHandler", () => {
    io.emit("skipBtnHandler");
  });
  socket.on("slowHandler", () => {
    io.emit("slowHandler");
  });
  socket.on("shieldHandler", () => {
    io.emit("shieldHandler");
  });
  socket.on("trapHandler", () => {
    io.emit("trapHandler");
  });
  socket.on("setTrap", (data) => {
    io.emit("setTrap", data);
  });

  socket.on("disconnect", (reason) => {
    // stop if the socket was disconnected by server
    if (reason === "server namespace disconnect") return;

    const leftPlayer = _removeThisPlayer(socket.id);

    _setRoomOwner();

    socket.broadcast.emit("playerLeave", {
      playersList: _getPlayersList(),
      leftPlayer,
    });
  });
});
