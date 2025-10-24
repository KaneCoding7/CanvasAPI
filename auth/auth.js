const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function generateAccessToken(userInfo) {
  if (!userInfo) {
    return null;
  }

  return jwt.sign(userInfo, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { verified: true, payload: payload };
  } catch (error) {
    return { verified: false, message: error.message };
  }
}

module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.verifyAccessToken = verifyAccessToken;
