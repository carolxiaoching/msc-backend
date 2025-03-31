const successHandler = require("../../services/successHandler");
const appError = require("../../services/appError");
const validationUtils = require("../../utils/validationUtils");
const paginationUtils = require("../../utils/paginationUtils");
const Category = require("../../models/category");

const CategoryControllers = {
  // 取得全部分類
  async getAllCategories(req, res, next) {
    // 預設按更新日期從新到舊排序 (desc)，若為 asc 則從舊到新排序
    const sort = req.query.sort === "asc" ? "updatedAt" : "-updatedAt";

    // 第幾頁，預設為 1
    const page = req.query.page ? Number(req.query.page) : 1;

    // 每頁幾筆，預設為 10
    const perPage = req.query.perPage ? Number(req.query.perPage) : 10;

    // 判斷是否不分頁
    const noPagination = req.query.noPagination === "true" ? true : false;

    if (noPagination) {
      // 不分頁，返回所有資料
      const results = await Category.find({}).sort(sort);

      successHandler(res, 200, results);
    } else {
      const { results, pagination } = await paginationUtils({
        model: Category,
        sort,
        page,
        perPage,
      });

      successHandler(res, 200, { results, pagination });
    }
  },

  // 取得指定分類
  async getCategory(req, res, next) {
    const { categoryId } = req.params;

    if (!validationUtils.isValidObjectId(categoryId)) {
      return appError(400, "分類 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Category, categoryId))) {
      return appError(400, "查無此分類！", next);
    }

    const category = await Category.findById(categoryId);

    successHandler(res, 200, category);
  },

  // 新增分類
  async createCategory(req, res, next) {
    const { title, categoryImgUrl } = req.body;

    if (!validationUtils.isObjectEmpty(req.body)) {
      return appError(400, "欄位不得為空！", next);
    }

    if (!validationUtils.isValidString(title, 1, 10)) {
      return appError(400, "分類標題需介於 1 到 10 個字元之間！", next);
    }

    if (!validationUtils.isValidUrl(categoryImgUrl)) {
      return appError(400, "分類圖片格式錯誤！", next);
    }

    // 新增資料
    const category = await Category.create({
      title,
      categoryImgUrl,
    });

    successHandler(res, 201, category);
  },

  // 更新分類
  async updateCategory(req, res, next) {
    const { categoryId } = req.params;
    const { title, categoryImgUrl } = req.body;

    const validations = [
      {
        condition: !validationUtils.isValidObjectId(categoryId),
        message: "分類 ID 錯誤！",
      },
      {
        condition: !(await validationUtils.isIdExist(Category, categoryId)),
        message: "查無此分類！",
      },
      {
        condition: !validationUtils.isObjectEmpty(req.body),
        message: "欄位不得為空！",
      },
      {
        condition: !validationUtils.isValidString(title, 1, 10),
        message: "分類標題需介於 1 到 10 個字元之間！",
      },
      {
        condition:
          categoryImgUrl !== undefined &&
          !validationUtils.isValidUrl(categoryImgUrl),
        message: "封面格式錯誤！",
      },
    ];

    const validationError = await validationUtils.checkValidation(validations);

    if (validationError) {
      return appError(400, validationError, next);
    }

    const newCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        title,
        categoryImgUrl,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    successHandler(res, 200, newCategory);
  },

  // 刪除指定分類
  async delCategory(req, res, next) {
    const { categoryId } = req.params;

    if (!validationUtils.isValidObjectId(categoryId)) {
      return appError(400, "分類 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Category, categoryId))) {
      return appError(400, "查無此分類！", next);
    }

    const delCategory = await Category.findByIdAndDelete(categoryId, {
      new: true,
    });

    // 若刪除失敗
    if (!delCategory) {
      return appError(400, "刪除失敗，查無此分類", next);
    }

    successHandler(res, 200, delCategory);
  },

  // 刪除全部分類
  async delAllCategories(req, res, next) {
    await Category.deleteMany({});

    successHandler(res, 200, []);
  },
};

module.exports = CategoryControllers;
