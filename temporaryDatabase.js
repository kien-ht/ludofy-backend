const playersList = [
  {
    isReady: false,
    position: "RED",
    key: 1,
  },
  {
    isReady: false,
    position: "GREEN",
    key: 2,
  },
  {
    isReady: false,
    position: "BLUE",
    key: 3,
  },
  {
    isReady: false,
    position: "YELLOW",
    key: 4,
  },
];

module.exports = {
  _getPlayersList() {
    return playersList;
  },

  _getRoomOwner() {
      const roomOwner = playersList.find(p => p.isRoomOwner)
      return playersList.indexOf(roomOwner) + 1
  },

  _isFullPlayer() {
    return playersList.every((p) => p.userName);
  },

  _hasThisPlayer(userName) {
    return !!playersList.find((p) => p.userName === userName);
  },

  _setPlayerInFirstEmptySlot(newPlayer) {
    const foundSlot = playersList.find((p) => !p.userName);
    const index = playersList.indexOf(foundSlot);

    playersList[index] = {
      ...foundSlot,
      ...newPlayer,
    };
    return playersList[index];
  },

  _removeThisPlayer(id) {
    const leftPlayer = playersList.find((p) => p.socketId === id);
    const index = playersList.indexOf(leftPlayer);
    if (!leftPlayer) return;
    const { isReady, position, key, userName } = leftPlayer;
    playersList[index] = {
      isReady,
      position,
      key,
    };
    return {
      userName,
    };
  },

  _setRoomOwner() {
    const currentRoomOwner = playersList.find((p) => p.isRoomOwner)
    if (currentRoomOwner) return
    playersList.forEach((p) => (p.isRoomOwner = false));
    const firstPlayer = playersList.find((p) => p.userName);
    if (!firstPlayer) return;
    firstPlayer.isRoomOwner = true;
  },
};
