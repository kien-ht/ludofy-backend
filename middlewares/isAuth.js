const { verifyToken } = require("../modules/users/users.controller");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const foundUser = await verifyToken(token);

    if (foundUser) {
      req.user = foundUser;
      next();
    } else {
      return res.json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res.status(401).json({ message: err.message || "Unauth" });
  }
};
