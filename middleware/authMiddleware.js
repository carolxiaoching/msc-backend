const successHandler = require("../services/successHandler");
const appError = require("../services/appError");
const errorAsyncHandler = require("../services/errorAsyncHandler");
const User = require("../models/user");
const { generateToken, verifyToken } = require("../utils/authUtils");

// 從 Headers 取得 token
const getTokenFromHeaders = (headers) => {
  if (headers.authorization && headers.authorization.startsWith("Bearer")) {
    return headers.authorization.split(" ")[1];
  }
  return "";
};

// 產生 JWT token 並回傳會員資料
const generateAndSendJWT = (res, statusCode, user) => {
  // 產生 token
  const token = generateToken({ id: user._id });

  // 將傳入的密碼清空，避免不小心外洩
  user.password = undefined;
  const data = {
    token,
    user: {
      _id: user._id,
      nickName: user.nickName,
      email: user.email,
      avatarImgUrl: user.avatarImgUrl,
      gender: user.gender,
      description: user.description,
    },
  };

  successHandler(res, statusCode, data);
};

// 檢查 token 並設定 authId
const checkTokenAndSetAuth = errorAsyncHandler(async (req, res, next) => {
  const token = getTokenFromHeaders(req.headers);
  if (!token) {
    return appError(401, "尚未登入！", next);
  }

  const decoded = await verifyToken(token);
  req.authId = decoded.id;

  next();
});

// 根據 authId 來設定會員資料
const getUserFromAuthId = errorAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.authId).select("+role");
  if (!user) {
    return appError(401, "查無此會員 ID", next);
  }

  req.auth = user;

  next();
});

// 檢查會員是否為管理員
const isAdmin = errorAsyncHandler(async (req, res, next) => {
  const { role } = req.auth;
  if (role !== "admin") {
    return appError(403, "無管理員權限", next);
  }
  next();
});

// 檢查 token 並設定 authId =>
const optionalAuth = errorAsyncHandler(async (req, res, next) => {
  const token = getTokenFromHeaders(req.headers);
  if (token) {
    const decoded = await verifyToken(token);
    req.authId = decoded.id;
  } else {
    req.authId = null;
  }
  next();
});

module.exports = {
  generateAndSendJWT,
  checkTokenAndSetAuth,
  getUserFromAuthId,
  isAdmin,
  optionalAuth,
};
