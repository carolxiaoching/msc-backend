const successHandler = require("../../services/successHandler");
const appError = require("../../services/appError");
const validationUtils = require("../../utils/validationUtils");
const paginationUtils = require("../../utils/paginationUtils");
const Recipe = require("../../models/recipe");
const Category = require("../../models/category");
const User = require("../../models/user");

const RecipeControllers = {
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
      isRecommended,
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
        condition:
          tags !== undefined && !(await validationUtils.isValidTags(tags)),
        message: "標籤欄位錯誤，且每個食譜最多只能有 3 個標籤！",
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
          isRecommended !== undefined && typeof isRecommended !== "boolean",
        message: "編輯推薦狀態格式錯誤！",
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
      isRecommended,
    });

    successHandler(res, 201, recipe);
  },

  // 取得所有食譜
  async getAllRecipes(req, res, next) {
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

    // 判斷是否不分頁
    const noPagination = req.query.noPagination === "true" ? true : false;

    if (noPagination) {
      // 不分頁，返回所有資料
      const results = await Recipe.find({}, displayFields).sort(sort);

      successHandler(res, 200, results);
    } else {
      const { results, pagination } = await paginationUtils({
        model: Recipe,
        sort,
        displayFields,
        page,
        perPage,
      });

      successHandler(res, 200, { results, pagination });
    }
  },

  // 取得指定食譜
  async getRecipe(req, res, next) {
    const { recipeId } = req.params;

    if (!validationUtils.isValidObjectId(recipeId)) {
      return appError(400, "食譜 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Recipe, recipeId))) {
      return appError(400, "查無此食譜！", next);
    }

    const recipe = await Recipe.findById(recipeId);

    successHandler(res, 200, recipe);
  },

  // 更新食譜
  async updateRecipe(req, res, next) {
    const { recipeId } = req.params;
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
      isRecommended,
    } = req.body;

    const validations = [
      {
        condition: !validationUtils.isValidObjectId(recipeId),
        message: "食譜 ID 錯誤！",
      },
      {
        condition: !(await validationUtils.isIdExist(Recipe, recipeId)),
        message: "查無此食譜！",
      },
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
          tags !== undefined && !(await validationUtils.isValidTags(tags)),
        message: "標籤欄位錯誤，且每個食譜最多只能有 3 個標籤！",
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
          isRecommended !== undefined && typeof isRecommended !== "boolean",
        message: "編輯推薦狀態格式錯誤！",
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
        isRecommended,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    successHandler(res, 200, newRecipe);
  },

  // 取得指定會員所有食譜
  async getMemberAllRecipes(req, res, next) {
    const { memberId } = req.params;

    if (!validationUtils.isValidObjectId(memberId)) {
      return appError(400, "會員 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(User, memberId))) {
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
    const query = { user: memberId };

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

  // 刪除指定食譜
  async delRecipe(req, res, next) {
    const { recipeId } = req.params;

    if (!validationUtils.isValidObjectId(recipeId)) {
      return appError(400, "食譜 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Recipe, recipeId))) {
      return appError(400, "查無此食譜！", next);
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

  // 刪除指定會員所有食譜
  async delMemberAllRecipes(req, res, next) {
    const { memberId } = req.params;

    if (!validationUtils.isValidObjectId(memberId)) {
      return appError(400, "會員 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(User, memberId))) {
      return appError(400, "查無此會員！", next);
    }

    // 查找指定會員擁有的所有食譜 ID
    const userRecipes = await Recipe.find({ user: memberId }).select("_id");

    // 將食譜 ID 提取為陣列
    const recipeIds = userRecipes.map((recipe) => recipe._id);

    // 刪除指定會員擁有的所有食譜
    await Recipe.deleteMany({ user: memberId });

    if (recipeIds.length) {
      // 從其他會員的收藏清單中移除此會員擁有的食譜 ID
      await User.updateMany(
        // 找到收藏了這些食譜的會員
        { collects: { $in: recipeIds } },
        // 從收藏清單中移除
        { $pull: { collects: { $in: recipeIds } } }
      );
    }

    successHandler(res, 200, []);
  },

  // 刪除所有食譜
  async delAllRecipes(req, res, next) {
    // 刪除所有食譜
    await Recipe.deleteMany({});

    // 清空所有會員的收藏清單
    await User.updateMany({}, { $set: { collects: [] } });

    successHandler(res, 200, []);
  },
};

module.exports = RecipeControllers;
