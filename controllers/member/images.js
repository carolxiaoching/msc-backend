const path = require("path");
const { v4: uuidv4 } = require("uuid");
const successHandler = require("../../services/successHandler");
const appError = require("../../services/appError");
const firebaseAdmin = require("../../connections/firebase");
const validationUtils = require("../../utils/validationUtils");
const Image = require("../../models/image");
const { compressImage, uploadToStorage } = require("../../utils/imageUtils");

const bucket = firebaseAdmin.storage().bucket();

const ImageControllers = {
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

    const delImage = await Image.findByIdAndDelete(
      imageId,
      {
        new: true,
      },
      { imageUrl: 1, type: 1, _id: 1 }
    );

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
