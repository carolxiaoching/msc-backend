const successHandler = require("../../services/successHandler");
const appError = require("../../services/appError");
const validationUtils = require("../../utils/validationUtils");
const Tag = require("../../models/tag");

const TagControllers = {
  // 取得全部標籤
  async getAllTags(req, res, next) {
    // 預設按更新日期從新到舊排序 (desc)，若為 asc 則從舊到新排序
    const sort = req.query.sort === "asc" ? "updatedAt" : "-updatedAt";
    const tags = await Tag.find({}, { title: 1, _id: 1 }).sort(sort);

    successHandler(res, 200, tags);
  },

  // 取得指定標籤
  async getTag(req, res, next) {
    const { tagId } = req.params;

    if (!validationUtils.isValidObjectId(tagId)) {
      return appError(400, "標籤 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Tag, tagId))) {
      return appError(400, "查無此標籤！", next);
    }

    const tag = await Tag.findById(tagId, { title: 1, _id: 1 });

    successHandler(res, 200, tag);
  },
};

module.exports = TagControllers;
