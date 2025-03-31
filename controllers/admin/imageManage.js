const path = require("path");
const { v4: uuidv4 } = require("uuid");
const successHandler = require("../../services/successHandler");
const appError = require("../../services/appError");
const firebaseAdmin = require("../../connections/firebase");
const validationUtils = require("../../utils/validationUtils");
const paginationUtils = require("../../utils/paginationUtils");
const Image = require("../../models/image");
const User = require("../../models/user");
const { compressImage, uploadToStorage } = require("../../utils/imageUtils");

const bucket = firebaseAdmin.storage().bucket();

const ImageControllers = {
  // 取得所有圖片
  async getAllImages(req, res, next) {
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
      const results = await Image.find({}).sort(sort);

      successHandler(res, 200, results);
    } else {
      const { results, pagination } = await paginationUtils({
        model: Image,
        sort,
        page,
        perPage,
      });

      successHandler(res, 200, { results, pagination });
    }
  },

  // 取得指定圖片
  async getImage(req, res, next) {
    const { imageId } = req.params;

    if (!validationUtils.isValidObjectId(imageId)) {
      return appError(400, "圖片 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Image, imageId))) {
      return appError(400, "查無此圖片！", next);
    }

    const image = await Image.findById(imageId);
    successHandler(res, 200, image);
  },

  // 刪除所有圖片
  async delAllImages(req, res, next) {
    // 刪除 firebase storage 中所有圖片
    try {
      await bucket.deleteFiles();
      await Image.deleteMany({});
      successHandler(res, 200, []);
    } catch (err) {
      appError(500, "刪除失敗，查無此圖片", next);
    }
  },

  // 刪除指定會員所有圖片
  async delMemberAllImages(req, res, next) {
    const { memberId } = req.params;

    if (!validationUtils.isValidObjectId(memberId)) {
      return appError(400, "會員 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(User, memberId))) {
      return appError(400, "查無此會員！", next);
    }

    // 刪除 firebase storage 中所有圖片
    try {
      await bucket.deleteFiles({ prefix: `images/${memberId}/` });
      // 刪除資料庫中所有圖片
      await Image.deleteMany({ user: memberId });
      successHandler(res, 200, []);
    } catch (err) {
      appError(500, "刪除失敗，查無此圖片", next);
    }
  },

  // 上傳圖片
  async uploadImage(req, res, next) {
    const { auth } = req;
    const type = req.query?.type ? req.query.type : "photo";

    // 確認圖片類型
    if (type !== "photo" && type !== "avatar" && type !== "icon") {
      return appError(400, "圖片類型錯誤！", next);
    }

    // 確認是否有上傳圖片
    if (!req.files?.length) {
      return appError(400, "尚未上傳圖片！", next);
    }

    try {
      // 取得上傳檔案資訊列表的第一個檔案
      const file = req.files[0];
      // 取得附檔名
      const ext = path.extname(file.originalname).toLowerCase();

      // 壓縮檔案
      const compressedImage = await compressImage(file.buffer, ext);
      // 設置路徑
      const imagePath = `images/${auth._id}/${uuidv4()}${ext}`;

      // 將資料上傳至 firebase storage 並取得檔案連結
      const imageUrl = await uploadToStorage(imagePath, compressedImage);

      const data = await Image.create({
        imageUrl,
        imagePath,
        type,
        user: auth._id,
      });

      const result = {
        _id: data._id,
        type: data.type,
        imageUrl: data.imageUrl,
      };

      return successHandler(res, 201, result);
    } catch (err) {
      return appError(500, "上傳失敗", next);
    }
  },

  // 刪除指定圖片
  async delImage(req, res, next) {
    const { imageId } = req.params;

    if (!validationUtils.isValidObjectId(imageId)) {
      return appError(400, "圖片 ID 錯誤！", next);
    }

    if (!(await validationUtils.isIdExist(Image, imageId))) {
      return appError(400, "查無此圖片！", next);
    }

    const delImage = await Image.findByIdAndDelete(imageId, {
      new: true,
    });

    // 若刪除失敗
    if (!delImage) {
      return appError(400, "刪除失敗，查無此圖片", next);
    }

    // 取得檔案路徑
    const { imagePath } = delImage;

    try {
      // 刪除 firebase storage 中圖片
      await bucket.file(imagePath).delete();
      successHandler(res, 200, delImage);
    } catch (err) {
      appError(500, "刪除失敗，查無此圖片", next);
    }
  },
};

module.exports = ImageControllers;
