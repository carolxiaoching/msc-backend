const jwt = require("jsonwebtoken");

// 驗證 token
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
};

// 產生 JWT Token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_DAY) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = {
  generateToken,
  verifyToken,
};
