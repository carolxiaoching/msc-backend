const successHandler = require("../../services/successHandler");
const appError = require("../../services/appError");
const validationUtils = require("../../utils/validationUtils");
const Category = require("../../models/category");

const CategoryControllers = {
  // 取得全部分類資訊
  async getAllCategories(req, res, next) {
    // 預設按更新日期從新到舊排序 (desc)，若為 asc 則從舊到新排序
    const sort = req.query.sort === "asc" ? "updatedAt" : "-updatedAt";
    const categories = await Category.find(
      {},
      { title: 1, categoryImgUrl: 1, _id: 1 }
    ).sort(sort);

    successHandler(res, 200, categories);
  },

  // 取得指定分類資訊
  async getCategory(req, res, next) {
    const { categoryId } = req.params;

    if (!validationUtils.isValidObjectId(categoryId)) {
      return appError(400, "分類 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Category, categoryId))) {
      return appError(400, "查無此分類！", next);
    }

    const category = await Category.findById(categoryId, {
      title: 1,
      categoryImgUrl: 1,
      _id: 1,
    });

    successHandler(res, 200, category);
  },
};

module.exports = CategoryControllers;
