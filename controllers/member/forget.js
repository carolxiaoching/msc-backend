const successHandler = require("../../services/successHandler");
const appError = require("../../services/appError");
const validationUtils = require("../../utils/validationUtils");
const User = require("../../models/user");
const { generateAndSendJWT } = require("../../middleware/authMiddleware");
const { generateToken, verifyToken } = require("../../utils/authUtils");

const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

// 創建 Nodemailer 寄信設定
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 應用程式密碼
  },
});

const forgetControllers = {
  // 寄送忘記密碼的 Eamil
  async forgetPassword(req, res, next) {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return appError(400, "查無此會員！", next);
    }

    // 產生 JWT Token 並設置 1 小時過期
    const resetToken = generateToken({ id: user._id }, "1h");

    const resetLink = `${
      process.env.NODE_ENV === "development"
        ? process.env.BASE_URL_DEV
        : process.env.BASE_URL_PROD
    }/#/reset-password?token=${resetToken}`;

    try {
      await transporter.sendMail({
        from: `"我的秘密食譜團隊" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "【我的秘密食譜】密碼重設請求",
        html: `
          <h2>重設您的【我的秘密食譜】帳戶密碼</h2>
          <p>您好，</p>
          <p>我們收到您的密碼重設請求，請點擊以下連結來重設您的密碼：</p>
          <p>
            <a href="${resetLink}" style="color: #007bff; text-decoration: none;">點此重設密碼</a>
          </p>
          <p>此連結將在 <strong>1 小時</strong> 後失效，若您未請求重設密碼，請忽略此郵件。</p>
          <p>謝謝！</p>
          <p><strong>我的秘密食譜團隊</strong></p>
        `,
      });

      return successHandler(res, 200, "密碼重設 Email 已發送");
    } catch (err) {
      return appError(400, "Email 發送失敗！", next);
    }
  },

  // 重置密碼
  async resetPassword(req, res, next) {
    const { token, password, confirmPassword } = req.body;

    // 驗證 Token
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (err) {
      return appError(401, "無效或過期的 Token！", next);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return appError(400, "查無此會員！", next);
    }

    const validations = [
      {
        condition: !validationUtils.isObjectEmpty(req.body),
        message: "欄位不得為空！",
      },
      {
        condition: !validationUtils.isValidPassword(password),
        message: "密碼需為英數混合，長度為 8 至 30 個字元！",
      },
      {
        condition: !validationUtils.isValidString(confirmPassword),
        message: "確認密碼不得為空！",
      },
      {
        condition: password !== confirmPassword,
        message: "密碼與確認密碼不一致！",
      },
    ];

    const validationError = await validationUtils.checkValidation(validations);

    if (validationError) {
      return appError(400, validationError, next);
    }

    // 將密碼加密
    const newPassword = await bcrypt.hash(password, 12);

    // 更新資料庫中密碼
    const newUser = await User.findByIdAndUpdate(
      user._id,
      {
        password: newPassword,
      },
      {
        new: true,
        runValidators: true,
        fields: "+email", // 顯示隱藏的 email 字段
      }
    );

    generateAndSendJWT(res, 200, newUser);
  },
};

module.exports = forgetControllers;
