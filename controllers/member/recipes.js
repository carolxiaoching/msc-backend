const appError = require("../../services/appError");
const successHandler = require("../../services/successHandler");
const validationUtils = require("../../utils/validationUtils");
const paginationUtils = require("../../utils/paginationUtils");
const Recipe = require("../../models/recipe");
const Category = require("../../models/category");
const User = require("../../models/user");

const RecipeControllers = {
  // 取得所有公開食譜
  async getAllPublicRecipes(req, res, next) {
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
    const query = { isPublic: true };

    // 編輯推薦搜尋
    if (req.query.isRecommended) {
      const isRecommended = req.query.isRecommended === "true" ? true : false;
      query.isRecommended = isRecommended;
    }

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

  // 取得指定會員所有公開食譜
  async getUserAllPublicRecipes(req, res, next) {
    const { userId } = req.params;

    if (!validationUtils.isValidObjectId(userId)) {
      return appError(400, "會員 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(User, userId))) {
      return appError(400, "查無此會員！", next);
    }

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
    const query = { user: userId, isPublic: true };

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

  // 取得指定食譜
  async getRecipe(req, res, next) {
    const { recipeId } = req.params;
    const { authId } = req;

    if (!validationUtils.isValidObjectId(recipeId)) {
      return appError(400, "食譜 ID 錯誤！", next);
    }

    let query = authId
      ? {
          _id: recipeId,
        }
      : {
          _id: recipeId,
          isPublic: true,
        };

    const recipe = await Recipe.findOne(query);

    // 檢查是否查找到食譜
    if (!recipe) {
      return appError(400, "查無此食譜或權限不足！", next);
    }

    // 權限檢查：非公開食譜只有作者可以查看
    if (!recipe.isPublic && !recipe.user._id.equals(authId)) {
      return appError(403, "您沒有權限查看此食譜！", next);
    }

    successHandler(res, 200, recipe);
  },

  // 取得我的所有食譜
  async getAllMyRecipes(req, res, next) {
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
    const query = { user: auth._id };

    // 公開/私人食譜搜尋
    if (req.query.isPublic) {
      const isPublic = req.query.isPublic === "true" ? true : false;
      query.isPublic = isPublic;
    }

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

  // 新增食譜
  async createRecipe(req, res, next) {
    const {
      title,
      description,
      note,
      isPublic,
      coverImgUrl,
      category,
      tags,
      cookingTime,
      servings,
      ingredients,
      nutritionFacts,
      steps,
    } = req.body;
    const { auth } = req;

    const validations = [
      {
        condition: !validationUtils.isObjectEmpty(req.body),
        message: "欄位不得為空！",
      },
      {
        condition: !validationUtils.isValidString(title, 2, 10),
        message: "標題欄位錯誤，且標題需介於 2 到 10 個字元之間！",
      },
      {
        condition: !validationUtils.isValidString(description, 2, 150),
        message: "食譜描述欄位錯誤，且描述需介於 2 到 150 個字元之間！",
      },
      {
        condition: typeof note !== "string",
        message: "小撇步欄位錯誤！",
      },
      {
        condition: typeof isPublic !== "boolean",
        message: "公開狀態格式錯誤！",
      },
      {
        condition: !validationUtils.isValidUrl(coverImgUrl),
        message: "封面格式錯誤！",
      },
      {
        condition:
          !validationUtils.isValidString(cookingTime) ||
          !["0-15 分鐘", "15-30 分鐘", "30 分鐘以上", "60 分鐘以上"].includes(
            cookingTime
          ),
        message: "烹飪時間欄位錯誤！",
      },
      {
        condition: !validationUtils.isValidNumber(servings, 1, 10),
        message: "份量欄位錯誤，且份量需介於 1 到 10 之間！",
      },
      {
        condition: !validationUtils.isValidObjectId(category),
        message: "分類 ID 錯誤！",
      },
      {
        condition: !(await validationUtils.isIdExist(Category, category)),
        message: "查無此分類！",
      },
      {
        condition: !validationUtils.isValidNutritionFacts(nutritionFacts),
        message: "營養資訊欄位錯誤！",
      },
      {
        condition: !validationUtils.isValidIngredients(ingredients),
        message: "食材欄位錯誤！",
      },
      {
        condition: !validationUtils.isValidSteps(steps),
        message: "步驟欄位錯誤！",
      },
      {
        condition:
          tags !== undefined && !(await validationUtils.isValidTags(tags)),
        message: "標籤欄位錯誤，且每個食譜最多只能有 3 個標籤！",
      },
    ];

    const validationError = await validationUtils.checkValidation(validations);

    if (validationError) {
      return appError(400, validationError, next);
    }

    const recipe = await Recipe.create({
      title,
      coverImgUrl,
      isPublic,
      category,
      tags,
      user: auth._id,
      cookingTime,
      description,
      servings,
      ingredients,
      nutritionFacts,
      steps,
      note,
    });

    successHandler(res, 201, recipe);
  },

  // 更新我的食譜
  async updateMyRecipe(req, res, next) {
    const { recipeId } = req.params;
    const { auth } = req;
    const {
      title,
      coverImgUrl,
      isPublic,
      category,
      tags,
      cookingTime,
      description,
      servings,
      note,
      ingredients,
      nutritionFacts,
      steps,
    } = req.body;

    if (!validationUtils.isValidObjectId(recipeId)) {
      return appError(400, "食譜 ID 錯誤！", next);
    }

    const isRecipeExist = await Recipe.findOne({
      _id: recipeId,
      user: auth._id,
    }).exec();

    if (!isRecipeExist) {
      return appError(400, "查無此食譜或權限不足！", next);
    }

    const validations = [
      {
        condition: !validationUtils.isObjectEmpty(req.body),
        message: "欄位不得為空！",
      },
      {
        condition:
          title !== undefined && !validationUtils.isValidString(title, 2, 10),
        message: "標題欄位錯誤，且標題需介於 2 到 10 個字元之間！",
      },
      {
        condition:
          description !== undefined &&
          !validationUtils.isValidString(description, 2, 150),
        message: "食譜描述欄位錯誤，且描述需介於 2 到 150 個字元之間！",
      },
      {
        condition: note !== undefined && typeof note !== "string",
        message: "小撇步欄位錯誤！",
      },
      {
        condition: isPublic !== undefined && typeof isPublic !== "boolean",
        message: "公開狀態格式錯誤！",
      },
      {
        condition:
          coverImgUrl !== undefined && !validationUtils.isValidUrl(coverImgUrl),
        message: "封面格式錯誤！",
      },
      {
        condition:
          cookingTime !== undefined &&
          (!validationUtils.isValidString(cookingTime) ||
            !["0-15 分鐘", "15-30 分鐘", "30 分鐘以上", "60 分鐘以上"].includes(
              cookingTime
            )),
        message: "烹飪時間欄位錯誤！",
      },
      {
        condition:
          servings !== undefined &&
          !validationUtils.isValidNumber(servings, 1, 10),
        message: "份量欄位錯誤，且份量需介於 1 到 10 之間！",
      },
      {
        condition:
          category !== undefined &&
          (!validationUtils.isValidObjectId(category) ||
            !(await validationUtils.isIdExist(Category, category))),
        message: "分類 ID 錯誤或查無此分類！",
      },
      {
        condition:
          nutritionFacts !== undefined &&
          !validationUtils.isValidNutritionFacts(nutritionFacts),
        message: "營養資訊欄位錯誤！",
      },
      {
        condition:
          ingredients !== undefined &&
          !validationUtils.isValidIngredients(ingredients),
        message: "食材欄位錯誤！",
      },
      {
        condition: steps !== undefined && !validationUtils.isValidSteps(steps),
        message: "步驟欄位錯誤！",
      },
      {
        condition:
          tags !== undefined && !(await validationUtils.isValidTags(tags)),
        message: "標籤欄位錯誤，且每個食譜最多只能有 3 個標籤！",
      },
    ];

    const validationError = await validationUtils.checkValidation(validations);

    if (validationError) {
      return appError(400, validationError, next);
    }

    const newRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      {
        title,
        coverImgUrl,
        isPublic,
        category,
        tags,
        cookingTime,
        description,
        servings,
        ingredients,
        nutritionFacts,
        steps,
        note,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    successHandler(res, 200, newRecipe);
  },

  // 刪除我的食譜
  async delMyRecipe(req, res, next) {
    const { recipeId } = req.params;
    const { auth } = req;

    if (!validationUtils.isValidObjectId(recipeId)) {
      return appError(400, "食譜 ID 錯誤！", next);
    }

    const isRecipeExist = await Recipe.findOne({
      _id: recipeId,
      user: auth._id,
    }).exec();

    if (!isRecipeExist) {
      return appError(400, "查無此食譜或權限不足！", next);
    }

    const delRecipe = await Recipe.findByIdAndDelete(recipeId, {
      new: true,
    });

    // 若刪除失敗
    if (!delRecipe) {
      return appError(400, "刪除失敗，查無此食譜 ID", next);
    }

    // 刪除食譜後，將該食譜從所有使用者的收藏清單中移除
    await User.updateMany({}, { $pull: { collects: recipeId } });

    successHandler(res, 200, delRecipe);
  },

  // 收藏食譜
  async createCollect(req, res, next) {
    const { recipeId } = req.params;
    const { auth } = req;

    if (!validationUtils.isValidObjectId(recipeId)) {
      return appError(400, "食譜 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Recipe, recipeId))) {
      return appError(400, "收藏失敗，查無此食譜！", next);
    }

    // 使用 $addToSet 將食譜 ID 加入 User 的 collects 陣列
    const result = await User.findByIdAndUpdate(
      auth._id,
      {
        $addToSet: { collects: recipeId },
      },
      { new: true }
    );

    // 如果更新前後的收藏數量不同，表示有新增成功
    if (result.collects.length > auth.collects.length) {
      // 使用 $inc 將 Recipe 的 collectsCount +1
      await Recipe.updateOne({ _id: recipeId }, { $inc: { collectsCount: 1 } });
    }

    const data = {
      recipeId,
      userId: auth._id,
    };

    successHandler(res, 201, data);
  },

  // 取消收藏食譜
  async delCollect(req, res, next) {
    const { recipeId } = req.params;
    const { auth } = req;

    if (!validationUtils.isValidObjectId(recipeId)) {
      return appError(400, "食譜 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Recipe, recipeId))) {
      return appError(400, "取消收藏失敗，查無此食譜！", next);
    }

    // 使用 $pull 將食譜 ID 從 User 的 collects 陣列中移除
    const result = await User.findByIdAndUpdate(
      auth._id,
      {
        $pull: { collects: recipeId },
      },
      { new: true }
    );

    // 如果更新前後的收藏數量不同，表示有新增成功
    if (
      auth.collects.length > result.collects.length &&
      result.collects.length > 0
    ) {
      // 使用 $inc 將 Recipe 的 collectsCount -1
      await Recipe.updateOne(
        { _id: recipeId },
        { $inc: { collectsCount: -1 } }
      );
    }

    const data = {
      recipeId,
      userId: auth._id,
    };

    successHandler(res, 200, data);
  },
};

module.exports = RecipeControllers;
