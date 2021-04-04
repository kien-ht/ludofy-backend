const socket = io();

const baseURL = "http://localhost:3333";

let playersList = [];

function findRoomOwner() {
  const foundOwner = playersList.find((p) => p.isRoomOwner);
  if (!foundOwner) return 1;
  return playersList.indexOf(foundOwner) + 1;
}

(async () => {
  const response = await axios({
    url: `${baseURL}/getPlayersList`,
    method: "GET",
  });
  playersList = response.data.data;

  res.currentPlayer = findRoomOwner();
})();

// const { _getPlayersList, _getRoomOwner } = require("../temporaryDatabase");

// sub-functions that will be used: start
const func = {
  newGame: function () {
    if (rules.isNewGame) {
      rules.isNewGame = false;

      for (let i = 1; i <= 4; i++) {
        for (let j = 1; j <= 2; j++) {
          document.getElementById(
            `home-${i}-${j}`
          ).src = `./Images/horse-player-${i}.png`;
        }

        for (let k = 1; k <= 6; k++) {
          document.getElementById(`finish-${i}0${k}`).src = "";
        }
      }

      for (let i = 1; i <= 56; i++) {
        if (i != 1 && i != 15 && i != 29 && i != 43) {
          document.getElementById(`cell-stand-${func.toId(i)}`).src =
            "./Images/stand-path-all.png";
        }
        document.getElementById(`path-${func.toId(i)}`).src = "";
        document.getElementById(
          `count-slow-horse-${func.toId(i)}`
        ).style.display = "none";
        document.getElementById(`count-slow-horse-${func.toId(i)}`).innerHTML =
          "";
        document.getElementById(
          `itemage-slow-horse-${func.toId(i)}`
        ).style.display = "none";
        document.getElementById(
          `count-shield-horse-${func.toId(i)}`
        ).style.display = "none";
        document.getElementById(
          `count-shield-horse-${func.toId(i)}`
        ).innerHTML = "";
        document.getElementById(
          `itemage-shield-horse-${func.toId(i)}`
        ).style.display = "none";
      }

      document.getElementById("endGameBoard").style.display = "none";
      document.getElementById("endGameBoard").innerHTML = "";
    }
  },

  sortItem: function (item, arr) {
    return arr.filter((a) => a === item).length;
  },

  findSelectedItem: function (event) {
    func.playWithPermission(() => {
      const itemSelected = parseInt(event.target.classList[1].split("-")[1]);
      const $itemSelected = document.getElementById(
        `item-${itemSelected}-container`
      );
      if (res.currentDice == "wait") {
        if (!$itemSelected.classList.contains("item-run-out")) {
          $itemSelected.classList.add("item-run-out");
        }
        if (
          availableItem[res.currentPlayer][itemSelected] === "slow" &&
          res.itemCount[res.currentPlayer]["slow"]
        ) {
          itemController.slowHandler();
        } else if (
          availableItem[res.currentPlayer][itemSelected] === "shield" &&
          res.itemCount[res.currentPlayer]["shield"]
        ) {
          itemController.shieldHandler();
        } else if (
          availableItem[res.currentPlayer][itemSelected] === "trap" &&
          res.itemCount[res.currentPlayer]["trap"]
        ) {
          itemController.trapHandler();
        }
      }
    });
  },

  getPlayerNumber(id) {
    return player.list.indexOf(player.list.filter((p) => p.id === id)[0]) + 1;
  },

  showWarning(msg) {
    console.log(msg);
  },

  playWithPermission(callback) {
    if (res.currentPlayer == player.number) {
      callback();
    } else {
      func.showWarning("It's not your turn!");
    }
  },

  showItemBeingUsed(item) {
    if (item === "none") {
      document.querySelector("#show-item-used").style.display = "none";
    } else {
      document.querySelector("#show-item-used").style.display = "block";
      document.querySelector(
        ".show-item-used"
      ).src = `./Images/item-${item}.png`;
    }
  },

  random: function () {
    // let arr = ['', 6, 2]
    // return arr[Math.floor(Math.random()*2) + 1]
    // let arr = ['', 1, 2, 3, 4, 5, 6, 6]
    // return arr[Math.floor(Math.random()*7) + 1]

    // return 6
    // return (Math.floor(Math.random()*3 + 1) )*2

    // return (Math.floor(Math.random()*6) + 1)

    if (
      res.itemActive[res.currentPlayer].slow[1] > 0 ||
      res.itemActive[res.currentPlayer].slow[2] > 0
    ) {
      return Math.floor(Math.random() * 3 + 1);
    } else {
      return Math.floor(Math.random() * 6 + 1);
    }
  },

  findNext: function () {
    //find next player
    let nextP = (res.currentPlayer % 4) + 1;
    while (res.winState[nextP] || !rules.activePlayer[nextP]) {
      //skip winning player and in active player
      nextP = (nextP % 4) + 1;
    }
    return nextP;
  },

  nextPlayer: function () {
    let next = this.findNext();
    res.currentDice = "wait";

    this.play(isSoundOn, nextPlayerSound);
    document.querySelector(".dice-highlight").style.backgroundColor =
      rules.turnMap[next];
    document
      .querySelector("#home-img-" + res.currentPlayer)
      .classList.remove("home-scaling");
    document
      .querySelector("#playername-container-" + res.currentPlayer)
      .classList.remove("home-scaling");

    res.currentPlayer = next;

    document.querySelector("#home-img-" + next).classList.add("home-scaling");
    document
      .querySelector("#playername-container-" + next)
      .classList.add("home-scaling");
    dice.classList.add("dice-scaling");
    dice.classList.remove("dice-rolled");

    //decrease all the slow and shield item
    func.decrementItem("slow");
    func.decrementItem("shield");
  },

  nextTurn: function () {
    res.currentDice = "wait";
    dice.classList.add("dice-scaling");
    dice.classList.remove("dice-rolled");

    //decrease all the slow and shield item
    func.decrementItem("slow");
    func.decrementItem("shield");
  },

  kick: function (player, horse) {
    // return true if kick is executed, false if not
    if (res.itemActive[player]["shield"][horse] > 0) {
      //if horse is protected
      this.play(isSoundOn, horseKickFalseSound);
      this.removeItem("shield", player, horse);
      if (res.currentDice == 6) {
        this.nextTurn();
      } else {
        this.nextPlayer();
      }
      return false;
    } else {
      // if not protected
      this.play(isSoundOn, horseKickSound);
      this.removeItem("slow", player, horse);
      //return horse to home position
      res.currentPos[player][horse] = 0;
      document.getElementById(
        `home-${player}-${horse}`
      ).src = `./Images/horse-player-${player}.png`;
      return true;
    }
  },

  fireHorseKick: function (next) {
    //parameter: next position
    let $next = document.getElementById(`path-${next}`);
    let player = "";
    let horse = 0;

    if ($next.getAttribute("src") != "") {
      // if next position is occupied
      player = $next.src.split("-")[2].split(".")[0];
      if (this.toId(res.currentPos[player][1]) == next) {
        //find out which horse is at next position
        horse = 1;
      } else {
        horse = 2;
      }

      if (player != res.currentPlayer) {
        if (res.itemActive[player]["shield"][horse] > 0) {
          //if horse is protected
          this.play(isSoundOn, horseKickFalseSound);
          this.removeItem("shield", player, horse);
          if (res.currentDice == 6) {
            this.nextTurn();
          } else {
            this.nextPlayer();
          }
          return true;
        } else {
          // if not protected
          this.play(isSoundOn, horseKickSound);
          this.removeItem("slow", player, horse);
          //return horse to home position
          res.currentPos[player][horse] = 0;
          document.getElementById(
            `home-${player}-${horse}`
          ).src = `./Images/horse-player-${player}.png`;
        }
      } else return true; //return true if horses are same player
    }
    return false; //return false if horses are different
  },

  trapKick: function (position, player, horse) {
    if (res.itemActive.trap.includes(parseInt(position))) {
      //if the position is trapped
      let isKicked = this.kick(player, horse);

      if (isKicked) {
        // if not protected, remove horse at a new position
        document.getElementById(`path-${func.toId(position)}`).src = "";
      }

      document.getElementById(`cell-stand-${this.toId(position)}`).src =
        "./Images/stand-path-all.png";
      res.itemActive.trap.splice(
        res.itemActive.trap.indexOf(parseInt(position)),
        1
      );
    }
  },

  checkBlocked: function (prefix, position) {
    //Check if path is blocked, return true or false. Parameter: prefix: 'path' or `finish-${res.currentPlayer}`, position: selected position
    for (let i = 1; i < res.currentDice; i++) {
      if (
        document
          .getElementById(`${prefix}${this.toId(parseInt(position) + i)}`)
          .getAttribute("src") != ""
      ) {
        return true;
      }
    }
    return false;
  },

  checkWin: function () {
    if (
      res.currentPos[res.currentPlayer][1] +
        res.currentPos[res.currentPlayer][2] ==
      rules.win[res.currentPlayer]
    ) {
      func.play(isSoundOn, playerFinishSound);
      res.winState[res.currentPlayer] = true;
      res.rank.push(res.currentPlayer);
      // res.rank.push(rules.playerEmail[res.currentPlayer]);

      const activePlayer = Object.values(rules.activePlayer).filter((a) => a)
        .length;
      if (activePlayer === res.rank.length) {
        //check if game is over
        res.isGameOver = true;
        alert("Game over!");
      }
    }
  },

  endGame: function () {
    //end the game
    document.getElementById("endGameBoard").style.display = "block";
    for (let i = 1; i < res.rank.length; i++) {
      let para = document.createElement("p");
      para.textContent = res.rank[i];
      document.getElementById("endGameBoard").appendChild(para);
    }
    //go back to waiting screen, probably put it in a different eventListner as the player click
    setTimeout(func.backToWaiting, 3000);
  },

  backToWaiting: function () {
    // exit()
    document.getElementById("waitingScreen").style.display = "block";
    document.getElementById("app").style.display = "none";
    document.getElementById("play-screen").style.display = "none";
    document.getElementById("avatar-selecting-screen").style.display = "none";
  },

  decrementItem: function (item) {
    for (let i = 1; i <= 4; i++) {
      // i: player
      if (!res.winState[i]) {
        for (let j = 1; j <= 2; j++) {
          // j: horse
          if (res.itemActive[i][item][j] > 0) {
            res.itemActive[i][item][j]--;
            document.getElementById(
              `count-${item}-horse-${func.toId(res.currentPos[i][j])}`
            ).innerHTML = res.itemActive[i][item][j];

            if (res.itemActive[i][item][j] == 0) {
              this.removeItem(item, i, j);
            }
          }
        }
      }
    }
  },

  moveItem: function (item, currentP, nextP) {
    //move item slow or shield
    if (
      document.getElementById(`count-${item}-horse-${func.toId(currentP)}`)
        .innerHTML > 0
    ) {
      document.getElementById(
        `itemage-${item}-horse-${func.toId(currentP)}`
      ).style.display = "none";
      document.getElementById(
        `itemage-${item}-horse-${func.toId(nextP)}`
      ).style.display = "block";
      document.getElementById(
        `count-${item}-horse-${func.toId(nextP)}`
      ).style.display = "block";
      document.getElementById(
        `count-${item}-horse-${func.toId(nextP)}`
      ).innerHTML = document.getElementById(
        `count-${item}-horse-${func.toId(currentP)}`
      ).innerHTML;
      document.getElementById(
        `count-${item}-horse-${func.toId(currentP)}`
      ).innerHTML = "";
      document.getElementById(
        `count-${item}-horse-${func.toId(currentP)}`
      ).style.display = "none";
    }
  },

  removeItem: function (item, player, horse) {
    //to remove slow item or shield item
    document.getElementById(
      `count-${item}-horse-${func.toId(res.currentPos[player][horse])}`
    ).style.display = "none";
    document.getElementById(
      `count-${item}-horse-${func.toId(res.currentPos[player][horse])}`
    ).innerHTML = "";
    document.getElementById(
      `itemage-${item}-horse-${func.toId(res.currentPos[player][horse])}`
    ).style.display = "none";
    res.itemActive[player][item][horse] = 0;
  },

  addItem: function (item, player, horse) {
    //to add slow item or shield item
    if (
      res.currentPos[player][horse] > 0 &&
      res.currentPos[player][horse] < 100
    ) {
      if (item == "slow") {
        // if item is slow
        res.itemActive[player][item][horse] += 7;
      } else {
        // if item is shield
        res.itemActive[player][item][horse] += 10;
      }
      document.getElementById(
        `count-${item}-horse-${func.toId(res.currentPos[player][horse])}`
      ).textContent = res.itemActive[player][item][horse];
      document.getElementById(
        `count-${item}-horse-${func.toId(res.currentPos[player][horse])}`
      ).style.display = "block";
      document.getElementById(
        `itemage-${item}-horse-${func.toId(res.currentPos[player][horse])}`
      ).style.display = "block";
    }
  },

  toId: function (idNum) {
    //convert number to id type
    if (idNum > 56) {
      idNum = idNum % 56;
    }

    if (idNum < 10) {
      idNum = "0" + idNum;
    }
    return idNum;
  },

  play: function (isAllowed, sound) {
    if (isAllowed) {
      sound.play();
    }
  },

  soundBtnHandler: function () {
    isSoundOn = !isSoundOn;
    func.play(true, clickSound);
    if (isSoundOn) {
      document.querySelectorAll(".btn-sound").forEach((item) => {
        item.src = "../Images/btn-sound-on.png";
      });
    } else {
      document.querySelectorAll(".btn-sound").forEach((item) => {
        item.src = "../Images/btn-sound-off.png";
      });
    }
  },

  musicBtnHandler: function () {
    isMusicOn = !isMusicOn;
    func.play(true, clickSound);
    if (isMusicOn) {
      document.querySelectorAll(".btn-music").forEach((item) => {
        item.src = "../Images/btn-music-on.png";
      });
    } else {
      document.querySelectorAll(".btn-music").forEach((item) => {
        item.src = "../Images/btn-music-off.png";
      });
    }
  },
};
// sub-functions that will be used: end

// subcribe event: start
socket.on("diceHandler", ({ currentDice }) => {
  res.currentDice = currentDice;

  // document.getElementById("timer").classList.remove("time-countdown");
  // setTimeout(() => {
  //   document.getElementById("timer").classList.add("time-countdown");
  // }, 1);

  func.play(isSoundOn, clickSound);
  dice.src = `./Images/dice-${res.currentDice}.png`;
  dice.classList.remove("dice-scaling");
  dice.classList.add("dice-rolled");

  if (
    res.currentDice !== 6 &&
    res.currentPos[res.currentPlayer][1] === 0 &&
    res.currentPos[res.currentPlayer][2] === 0
  ) {
    func.nextPlayer();
  }
});
socket.on("homeHandler", ({ selectedPlayer, selectedPos }) => {
  res.selectedPlayer = selectedPlayer;
  res.selectedPos = selectedPos;

  if (
    res.currentDice == 6 &&
    res.currentPlayer == res.selectedPlayer &&
    res.currentPos[res.currentPlayer][res.selectedPos] == 0
  ) {
    func.play(isSoundOn, horseStartSound);
    let kickSameHorse = func.fireHorseKick(
      func.toId(rules.start[res.currentPlayer])
    );
    if (!kickSameHorse) {
      document.getElementById(
        `home-${res.selectedPlayer}-${res.selectedPos}`
      ).src = "";
      document.getElementById(
        `path-${func.toId(rules.start[res.currentPlayer])}`
      ).src = `./Images/horse-player-${res.currentPlayer}.png`;
      res.currentPos[res.currentPlayer][res.selectedPos] =
        rules.start[res.currentPlayer];
      func.nextTurn();
    }
  }
});
socket.on("pathHandler", ({ selectedPos, playerHorse }) => {
  res.selectedPos = selectedPos;

  if (playerHorse[1] == res.selectedPos || playerHorse[2] == res.selectedPos) {
    res.selectedHorse = playerHorse[1] == res.selectedPos ? 1 : 2;

    if (res.isShield) {
      //check if shield item is selected
      func.play(isSoundOn, clickSound);
      func.addItem("shield", res.currentPlayer, res.selectedHorse);
      res.itemCount[res.currentPlayer].shield--;

      document.querySelector(".bg-container").style.cursor = "pointer";
      res.isShield = false;
      func.showItemBeingUsed("none");
    } else if (res.currentDice != "wait") {
      if (res.selectedPos != ((rules.finish[res.currentPlayer] - 1) % 56) + 1) {
        let nextPosId =
          ((res.currentDice + playerHorse[res.selectedHorse] - 1) % 56) + 1;
        let nextPosRound =
          res.currentDice +
          res.currentPos[res.currentPlayer][res.selectedHorse];

        if (
          nextPosRound <= rules.finish[res.currentPlayer] &&
          !func.checkBlocked(
            "path-",
            res.currentPos[res.currentPlayer][res.selectedHorse]
          )
        ) {
          //if still in path loop and not blocked by others
          let kickSameHorse = func.fireHorseKick(func.toId(nextPosId));
          if (!kickSameHorse) {
            //if next position is not the same horse
            //move horse to the new position
            func.play(isSoundOn, clickSound);
            document.getElementById(
              `path-${func.toId(nextPosId)}`
            ).src = `./Images/horse-player-${res.currentPlayer}.png`;
            document.getElementById(`path-${func.toId(res.selectedPos)}`).src =
              "";
            res.currentPos[res.currentPlayer][res.selectedHorse] = nextPosRound;

            func.moveItem("slow", playerHorse[res.selectedHorse], nextPosId);
            func.moveItem("shield", playerHorse[res.selectedHorse], nextPosId);

            func.trapKick(
              res.currentPos[res.currentPlayer][res.selectedHorse],
              res.currentPlayer,
              res.selectedHorse
            );
            //next turn or next player
            if (res.currentDice == 6) {
              func.nextTurn();
            } else {
              func.nextPlayer();
            }
          }
        }
      } else {
        //horse standing in front of finishing line
        if (
          !func.checkBlocked(`finish-${res.currentPlayer}`, 0) &&
          res.currentPos[res.currentPlayer][3 - res.selectedHorse] !=
            100 * res.currentPlayer + res.currentDice
        ) {
          func.play(isSoundOn, clickSound);
          //move horse to the new position
          document.getElementById(
            `finish-${res.currentPlayer}${func.toId(res.currentDice)}`
          ).src = `./Images/horse-player-${res.currentPlayer}.png`;
          document.getElementById(`path-${func.toId(res.selectedPos)}`).src =
            "";
          res.currentPos[res.currentPlayer][res.selectedHorse] =
            100 * res.currentPlayer + res.currentDice;

          func.moveItem(
            "slow",
            playerHorse[res.selectedHorse],
            res.currentPos[res.currentPlayer][res.selectedHorse]
          );
          func.moveItem(
            "shield",
            playerHorse[res.selectedHorse],
            res.currentPos[res.currentPlayer][res.selectedHorse]
          );

          //next turn or next player
          func.checkWin();
          if (!res.isGameOver) {
            if (res.winState[res.currentPlayer] || res.currentDice != 6) {
              func.nextPlayer();
            } else {
              func.nextTurn();
            }
          } else {
            func.endGame();
          }
        }
      }
    }
  }
});
socket.on("finishHandler", ({ selectedPos, selectedHorse }) => {
  res.selectedPos = selectedPos;
  res.selectedHorse = selectedHorse;

  if (
    res.currentDice - 1 == res.selectedPos.split("0")[1] &&
    res.currentPos[res.currentPlayer][3 - res.selectedHorse] !=
      100 * res.currentPlayer + res.currentDice
  ) {
    func.play(isSoundOn, clickSound);
    document.getElementById(
      `finish-${res.currentPlayer}${func.toId(res.currentDice)}`
    ).src = `./Images/horse-player-${res.currentPlayer}.png`;
    document.getElementById(`finish-${res.selectedPos}`).src = "";
    res.currentPos[res.currentPlayer][res.selectedHorse] =
      100 * res.currentPlayer + res.currentDice;

    func.moveItem(
      "slow",
      res.selectedPos,
      res.currentPos[res.currentPlayer][res.selectedHorse]
    );
    func.moveItem(
      "shield",
      res.selectedPos,
      res.currentPos[res.currentPlayer][res.selectedHorse]
    );

    func.checkWin();
    if (!res.isGameOver) {
      if (res.winState[res.currentPlayer] || res.currentDice != 6) {
        func.nextPlayer();
      } else {
        func.nextTurn();
      }
    } else {
      func.endGame();
    }
  }
});
socket.on("skipBtnHandler", () => {
  func.play(isSoundOn, clickSound);
  if (res.currentDice == 6) {
    func.nextTurn();
  } else {
    func.nextPlayer();
  }
});
socket.on("slowHandler", () => {
  res.itemCount[res.currentPlayer].slow--;
  for (let i = 1; i <= 4; i++) {
    if (res.currentPlayer != i && !res.winState[i]) {
      for (let j = 1; j <= 2; j++) {
        func.addItem("slow", i, j);
      }
    }
  }
  func.play(isSoundOn, itemClickSound);
});
socket.on("shieldHandler", () => {
  if (res.isShield) {
    func.showItemBeingUsed("none");
  } else {
    func.showItemBeingUsed("shield");
  }
  res.isShield = !res.isShield;
  func.play(isSoundOn, itemClickSound);
  // console.log('shield is being used by the current player!')
});
socket.on("trapHandler", () => {
  if (res.isTrap) {
    func.showItemBeingUsed("none");
  } else {
    func.showItemBeingUsed("trap");
  }
  res.isTrap = !res.isTrap;
  func.play(isSoundOn, itemClickSound);
  // console.log('trap is being used by the current player!')
});
socket.on("setTrap", (id) => {
  func.play(isSoundOn, clickSound);
  res.isTrap = false;
  res.itemCount[res.currentPlayer].trap--;
  res.itemActive.trap.push(parseInt(id.split("-")[2])); //store position of trap
  func.showItemBeingUsed("none");
});
// subcribe event: end

// Main controller and button handler: start
const mainController = {
  diceHandler: function () {
    func.playWithPermission(() => {
      if (res.currentDice === "wait") {
        res.currentDice = func.random();

        socket.emit("diceHandler", {
          currentDice: res.currentDice,
        });
      }
    });
  },

  homeHandler: function (event) {
    func.playWithPermission(() => {
      res.selectedPlayer = event.target.id.split("-")[1];
      res.selectedPos = event.target.id.split("-")[2];

      socket.emit("homeHandler", {
        selectedPlayer: res.selectedPlayer,
        selectedPos: res.selectedPos,
      });
    });
  },

  pathHandler: function (event) {
    func.playWithPermission(() => {
      res.selectedPos = parseInt(event.target.id.split("-")[1]);
      const playerHorse = {
        1: ((res.currentPos[res.currentPlayer][1] - 1) % 56) + 1,
        2: ((res.currentPos[res.currentPlayer][2] - 1) % 56) + 1,
      };

      socket.emit("pathHandler", {
        selectedPos: res.selectedPos,
        playerHorse,
      });
    });
  },

  finishHandler: function (event) {
    func.playWithPermission(() => {
      res.selectedPos = event.target.id.split("-")[1];
      res.selectedHorse =
        res.currentPos[res.currentPlayer][1] == res.selectedPos ? 1 : 2;

      socket.emit("finishHandler", {
        selectedPos: res.selectedPos,
        selectedHorse: res.selectedHorse,
      });
    });
  },

  skipBtnHandler: function () {
    func.playWithPermission(() => {
      socket.emit("skipBtnHandler");
    });
  },
};
// Main controller and button handler: end

// Item controller: start
const itemController = {
  slowHandler: function () {
    socket.emit("slowHandler");
  },

  shieldHandler: function () {
    if (res.isShield) {
      document.querySelector(".bg-container").style.cursor = "pointer";
    } else {
      document.querySelector(".bg-container").style.cursor =
        "url('./Images/shield-cursor.png') 6 6, auto";
    }
    socket.emit("shieldHandler");
  },

  trapHandler: function () {
    if (res.isTrap) {
      document.querySelector(".bg-container").style.cursor = "pointer";
    } else {
      document.querySelector(".bg-container").style.cursor =
        "url('./Images/trap-cursor.png') 6 6, auto";
    }
    socket.emit("trapHandler");
  },

  setTrap: function (event) {
    func.playWithPermission(() => {
      if (res.isTrap) {
        if (
          !res.itemActive.trap.includes(parseInt(event.target.id.split("-")[2]))
        ) {
          event.target.src = "./Images/item-trap-used.png"; //only at the current player's screen
          document.querySelector(".bg-container").style.cursor = "pointer";
          socket.emit("setTrap", event.target.id);
        }
      }
    });
  },
};
// Item controller: end

let isSoundOn = true;
let isMusicOn = true;

// results that need to be updated every turn: start

const availableItem = {
  1: ["slow", "shield", "trap"],
  2: ["slow", "shield", "trap"],
  3: ["slow", "shield", "trap"],
  4: ["slow", "shield", "trap"],
};

let res = {
  currentPos: {
    //each player current position
    1: { 1: 0, 2: 0 }, //player 1: { horse 1: 0, horse 2: 0 }
    2: { 1: 0, 2: 0 },
    3: { 1: 0, 2: 0 },
    4: { 1: 0, 2: 0 },
  },

  currentPlayer: 1,

  currentDice: "wait", // current dice number, 'wait' indicates dice is waiting to be rolled

  itemCount: {
    //numbers of each item left
    1: {
      slow: func.sortItem("slow", availableItem["1"]),
      shield: func.sortItem("shield", availableItem["1"]),
      trap: func.sortItem("trap", availableItem["1"]),
    },
    2: {
      slow: func.sortItem("slow", availableItem["2"]),
      shield: func.sortItem("shield", availableItem["2"]),
      trap: func.sortItem("trap", availableItem["2"]),
    },
    3: {
      slow: func.sortItem("slow", availableItem["3"]),
      shield: func.sortItem("shield", availableItem["3"]),
      trap: func.sortItem("trap", availableItem["3"]),
    },
    4: {
      slow: func.sortItem("slow", availableItem["4"]),
      shield: func.sortItem("shield", availableItem["4"]),
      trap: func.sortItem("trap", availableItem["4"]),
    },
  },

  itemActive: {
    // numbers of active items of each horse
    1: {
      //player 1
      slow: { 1: 0, 2: 0 },
      shield: { 1: 0, 2: 0 },
    },
    2: {
      //player 2
      slow: { 1: 0, 2: 0 },
      shield: { 1: 0, 2: 0 },
    },
    3: {
      //player 3
      slow: { 1: 0, 2: 0 },
      shield: { 1: 0, 2: 0 },
    },
    4: {
      //player 4
      slow: { 1: 0, 2: 0 },
      shield: { 1: 0, 2: 0 },
    },
    trap: [], //store all the trap positions
  },

  winState: {
    //each player's winning state
    1: false,
    2: false,
    3: false,
    4: false,
  },

  rank: [0],

  isGameOver: false,

  selectedPos: "",
  selectedPlayer: "",
  selectedHorse: "",
  isShield: false,
  isTrap: false,
};
// results that need to be updated every turn: end

// rules of game: start
const rules = {
  start: {
    //each player starting point
    1: 1, //player 1: path-01
    2: 15, //player 2: path-15
    3: 29, //player 3: path-29
    4: 43, //player 4: path-43
  },

  finish: {
    //each player path finishing point
    1: 56, //player 1: path-56
    2: 70, //player 2: path-14
    3: 84, //player 3: path-28
    4: 98, //player 4: path-42
  },

  win: {
    //winning condition
    1: 211, //105 + 106 = 211, sum of the 2 final positions
    2: 411, //205 + 206 = 411
    3: 611, //305 + 306 = 611
    4: 811, //405 + 406 = 811
  },

  turnMap: {
    1: "red",
    2: "green",
    3: "blue",
    4: "yellow",
  },

  isNewGame: false,

  activePlayer: {
    1: true,
    2: true,
    3: false,
    4: false,
  },
};
// rules of game: end

const player = {
  name: "",
  number: "",
  id: "",
  list: {
    1: "",
    2: "",
    3: "",
    4: "",
  },
};

const playerNames = {
  1: "",
  2: "",
  3: "",
  4: "",
};

// Global variables and eventlisteners: start
var dice = document.querySelector(".dice-image");
dice.addEventListener("click", mainController.diceHandler);
document
  .querySelector(".skip-btn")
  .addEventListener("click", mainController.skipBtnHandler);

for (let i = 1; i <= 56; i++) {
  document
    .getElementById(`path-${func.toId(i)}`)
    .addEventListener("click", mainController.pathHandler);
}

for (let i = 1; i <= 4; i++) {
  document
    .getElementById(`home-${i}-1`)
    .addEventListener("click", mainController.homeHandler);
  document
    .getElementById(`home-${i}-2`)
    .addEventListener("click", mainController.homeHandler);
}

for (let i = 1; i <= 4; i++) {
  for (let j = 1; j <= 6; j++) {
    document
      .getElementById(`finish-${i}${func.toId(j)}`)
      .addEventListener("click", mainController.finishHandler);
  }
}

for (let i = 1; i <= 56; i++) {
  if (
    i != rules.start[1] &&
    i != rules.start[2] &&
    i != rules.start[3] &&
    i != rules.start[4]
  ) {
    document
      .getElementById(`cell-stand-${func.toId(i)}`)
      .addEventListener("click", itemController.setTrap);
  }
}

for (let i = 0; i < 3; i++) {
  document
    .getElementById(`itemage-${i}-area`)
    .addEventListener("click", func.findSelectedItem);
}

// Global variables and eventlisteners: end

//sound: star
var clickSound = document.getElementById("click-sound");
var horseKickSound = document.getElementById("horse-kick-sound");
var nextPlayerSound = document.getElementById("next-player-sound");
var horseKickFalseSound = document.getElementById("horse-kick-false-sound");

var cashGenerateSound = document.getElementById("cash-generate-sound");
var horseMovingSound = document.getElementById("horse-moving-sound");
var horseStartSound = document.getElementById("horse-start-sound");
var itemClickSound = document.getElementById("item-click-sound");
var playerFinishSound = document.getElementById("player-finish-sound");
var popUpNotificationSound = document.getElementById(
  "pop-up-notification-sound"
);
var backgroundMusic = document.getElementById("background-music");

//sound: end

document.querySelectorAll(".btn-sound").forEach((item) => {
  item.addEventListener("click", func.soundBtnHandler);
});
document.querySelectorAll(".btn-music").forEach((item) => {
  item.addEventListener("click", func.musicBtnHandler);
});

socket.on("newPlayerEnter", ({ playerList, id }) => {
  console.log(`${id} has entered this game`);
  player.list = playerList;
  if (!player.id) {
    player.id = id;
    player.number = func.getPlayerNumber(player.id);

    for (let i = 0; i < 3; i++) {
      const itemage = document.getElementById(`itemage-${i}-area`);
      const container = document.getElementById(`item-${i}-container`);
      if (availableItem[player.number][i]) {
        itemage.src = `./Images/item-${availableItem[player.number][i]}.png`;
      } else {
        itemage.src = "";
        container.classList.add("item-run-out");
      }
    }
  }
  console.log(player.number);
});

socket.on("playerLeave", ({ socketId }) => {
  console.log(`${socketId} has left this game`);
  rules.activePlayer[func.getPlayerNumber(socketId)] = false;
});
