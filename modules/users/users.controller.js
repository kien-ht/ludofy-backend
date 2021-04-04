const User = require("./users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

function genToken(userId) {
  return (token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }));
}

module.exports = {
  async createUser({ userName, password }) {
    const foundUser = await User.findOne({
      userName,
    });

    if (foundUser) throw new Error("User exists!");

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ userName, password: hashedPassword });

    const token = genToken(newUser._id);

    return { ...newUser._doc, token };
  },

  async findUser({ userName, password }) {
    const foundUser = await User.findOne({
      userName,
    }).lean();

    if (!foundUser) throw new Error("userName doesn't exist!");

    const isSamePassword = await bcrypt.compare(password, foundUser.password);

    if (!isSamePassword) throw new Error("Password is incorrect!");

    const token = genToken(foundUser._id);

    return { ...foundUser, token };
  },

  async verifyToken(token) {
    if (!token) throw new Error("Token is required!");

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    return await User.findById(verifyToken.userId);
  },
};
