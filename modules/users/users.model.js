const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  userName: {
    type: String,
    maxLength: 12,
    require: true,
  },
  password: {
    type: String,
    minLength: 4,
    require: true,
  },
  avatar: {
    type: String,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
  horses: {
    type: Array,
    default: () => [
      {
        name: "1",
        experience: 0,
        health: 100,
      },
      {
        name: "2",
        experience: 0,
        health: 100,
      },
    ],
  },
  balance: {
    type: Number,
    default: 0,
  },
  experience: {
    type: Number,
    default: 0,
  },
  itemInPlay: {
    type: Object,
    default: () => ({
      shield: 0,
      slow: 0,
      trap: 0,
    }),
  },
  itemInFarm: {
    type: Object,
    default: () => ({
      grass: 0,
      health: 0,
      experience: 0,
    }),
  },
});

module.exports = mongoose.model("User", UserSchema);
