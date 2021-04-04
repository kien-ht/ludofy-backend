const User = require("./users.model");
const router = require("express").Router();
const isAuth = require("../../middlewares/isAuth");
const UserController = require("./users.controller");

router.get("/", isAuth, async (req, res) => {
  const foundUsers = await User.find();

  res.json({ success: true, data: foundUsers });
});

router.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  try {
    const foundUser = await UserController.findUser({ userName, password });
    res.json({ success: true, data: foundUser });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { userName, password } = req.body;
  try {
    const newUser = await UserController.createUser({ userName, password });
    res.json({ success: true, data: newUser });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get("/verify", async (req, res) => {
  const token = req.headers.authorization;
  try {
    const foundUser = await UserController.verifyToken(token);
    res.json({ success: true, data: foundUser });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
