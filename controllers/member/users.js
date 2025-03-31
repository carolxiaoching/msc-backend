const bcrypt = require("bcryptjs");
const appError = require("../../services/appError");
const successHandler = require("../../services/successHandler");
const validationUtils = require("../../utils/validationUtils");
const paginationUtils = require("../../utils/paginationUtils");
const { generateAndSendJWT } = require("../../middleware/authMiddleware");
const User = require("../../models/user");
const Recipe = require("../../models/recipe");

const UserControllers = {
  // 註冊
  async signUp(req, res, next) {
    const { nickName, email, password, confirmPassword } = req.body;

    const validations = [
      {
        condition: !validationUtils.isObjectEmpty(req.body),
        message: "欄位不得為空！",
      },
      {
        condition: !validationUtils.isValidString(nickName, 2, 10),
        message: "暱稱需介於 2 到 10 個字元之間！",
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
      {
        condition: !validationUtils.isValidEmail(email),
        message: "電子信箱格式錯誤！",
      },
    ];

    const validationError = await validationUtils.checkValidation(validations);

    if (validationError) {
      return appError(400, validationError, next);
    }

    // 驗證電子信箱是否已被使用
    const checkEmailUnique = await User.findOne({ email });
    if (checkEmailUnique) {
      return appError(400, "此電子信箱已被使用！", next);
    }

    // 將密碼加密
    const newPassword = await bcrypt.hash(password, 12);

    // 新增資料
    const newUser = await User.create({
      nickName,
      email,
      password: newPassword,
      avatarImgUrl: "",
      description: "",
      gender: "secret",
      role: "member",
    });

    // 產生 JWT token 並回傳會員資料
    generateAndSendJWT(res, 201, newUser);
  },

  // 登入
  async signIn(req, res, next) {
    const { email, password } = req.body;

    const validations = [
      {
        condition: !validationUtils.isObjectEmpty(req.body),
        message: "欄位不得為空！",
      },
      {
        condition: !validationUtils.isValidString(password),
        message: "密碼欄位錯誤！",
      },
      {
        condition: !validationUtils.isValidEmail(email),
        message: "電子信箱格式錯誤！",
      },
    ];

    const validationError = await validationUtils.checkValidation(validations);

    if (validationError) {
      return appError(400, validationError, next);
    }

    // 取出 user 資料
    const user = await User.findOne({ email }).select("+password");

    // 驗證電子郵件是否已註冊
    if (!user) {
      return appError(400, "此帳號尚未被註冊過！", next);
    }

    // 比對密碼是否與資料庫的相符
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return appError(400, "密碼錯誤！", next);
    }

    // 產生 JWT token 並回傳會員資料
    generateAndSendJWT(res, 200, user);
  },

  // 取得指定會員公開資料
  async getUserPublicProfile(req, res, next) {
    const { userId } = req.params;

    if (!validationUtils.isValidObjectId(userId)) {
      return appError(400, "會員 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(User, userId))) {
      return appError(400, "查無此會員！", next);
    }

    const user = await User.findById(userId).lean();

    // 計算擁有食譜數量
    const recipeCount = await Recipe.countDocuments({ user: userId });

    // 計算收藏數量
    const collectCount = await user.collects.length;

    user.recipeCount = recipeCount;
    user.collectCount = collectCount;

    successHandler(res, 200, user);
  },

  // 取得我的資料
  async getMyProfile(req, res, next) {
    const { auth } = req;
    const user = await User.findById(auth._id).select("+email").lean();

    // 計算擁有食譜數量
    const recipeCount = await Recipe.countDocuments({ user: auth._id });

    // 計算收藏數量
    const collectCount = await user.collects.length;

    user.recipeCount = recipeCount;
    user.collectCount = collectCount;

    successHandler(res, 200, user);
  },

  // 更新我的資料
  async updateMyProfile(req, res, next) {
    const { auth } = req;
    const { nickName, gender, avatarImgUrl, description } = req.body;

    const validations = [
      {
        condition: !validationUtils.isObjectEmpty(req.body),
        message: "欄位不得為空！",
      },
      {
        condition:
          nickName !== undefined &&
          !validationUtils.isValidString(nickName, 2, 10),
        message: "暱稱需介於 2 到 10 個字元之間！",
      },
      {
        condition:
          gender !== undefined &&
          !["secret", "male", "female"].includes(gender),
        message: "性別欄位錯誤！",
      },
      {
        condition:
          avatarImgUrl !== undefined &&
          !validationUtils.isValidUrl(avatarImgUrl),
        message: "頭像格式錯誤！",
      },
      {
        condition:
          description !== undefined &&
          !validationUtils.isValidString(description, 1, 100),
        message: "自我介紹需小於 100 個字元！",
      },
    ];

    const validationError = await validationUtils.checkValidation(validations);

    if (validationError) {
      return appError(400, validationError, next);
    }

    const newUser = await User.findByIdAndUpdate(
      auth._id,
      {
        nickName,
        gender,
        avatarImgUrl,
        description,
      },
      {
        new: true,
        runValidators: true,
        fields: "+email", // 顯示隱藏的 email 字段
      }
    ).lean();

    // 計算擁有食譜數量
    const recipeCount = await Recipe.countDocuments({ user: auth._id });

    // 計算收藏數量
    const collectCount = await newUser.collects.length;

    newUser.recipeCount = recipeCount;
    newUser.collectCount = collectCount;

    successHandler(res, 200, newUser);
  },

  // 重設密碼
  async updatePassword(req, res, next) {
    const { auth } = req;
    const { password, confirmPassword } = req.body;

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
      auth._id,
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

  // 取得我的收藏列表
  async getCollectList(req, res, next) {
    const { auth } = req;

    // 排序
    const sortOptions = {
      asc: "createdAt", // 建立日期從新到舊排序
      desc: "-createdAt", // 建立日期從舊到新排序
      hot: "collectsCount", // 收藏從多到少排序
    };
    const sort = sortOptions[req.query.sort] || "-createdAt";

    // 第幾頁，預設為 1
    const page = req.query.page ? Number(req.query.page) : 1;

    // 每頁幾筆，預設為 10
    const perPage = req.query.perPage ? Number(req.query.perPage) : 10;

    // 預設搜尋條件
    const query = {
      _id: { $in: auth.collects },
      isPublic: true,
    };

    // 分類搜尋
    if (req.query.category) {
      query.category = req.query.category;
    }

    // 關鍵字搜尋
    if (req.query.keyword) {
      query.title = new RegExp(req.query.keyword);
    }

    // 標籤搜尋
    if (req.query.tags) {
      // 將 tags 字串分割為陣列
      const tagsArray = req.query.tags.split(",");
      query.tags = { $all: tagsArray };
    }

    const displayFields = {
      _id: 1,
      title: 1,
      coverImgUrl: 1,
      category: 1,
      tags: 1,
      user: 1,
      isPublic: 1,
      description: 1,
      cookingTime: 1,
      servings: 1,
      collectsCount: 1,
      createdAt: 1,
      updatedAt: 1,
      isRecommended: 1,
    };

    const { results, pagination } = await paginationUtils({
      model: Recipe,
      query,
      sort,
      displayFields,
      page,
      perPage,
    });

    successHandler(res, 200, { results, pagination });
  },
};

module.exports = UserControllers;
