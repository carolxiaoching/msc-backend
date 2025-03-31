const tinify = require("tinify");
const firebaseAdmin = require("../connections/firebase");

const bucket = firebaseAdmin.storage().bucket();
tinify.key = process.env.TINYPNG_API_KEY;

// 壓縮檔案
const compressImage = async (buffer, ext) => {
  if ([".jpg", ".png", ".jpeg", ".webp"].includes(ext)) {
    try {
      const compressedBuffer = await tinify.fromBuffer(buffer).toBuffer();
      return compressedBuffer;
    } catch (err) {
      console.log("圖片壓縮失敗:", err);
      return buffer; // 壓縮失敗，則回傳原始 buffer
    }
  } else {
    console.log("不支援的圖片格式");
    return buffer; // 若格式不支援，則回傳原始 buffer
  }
};

const uploadToStorage = (imagePath, fileBuffer) => {
  return new Promise((resolve, reject) => {
    // 基於檔案的原始名稱建立一個 blob 物件
    const blob = bucket.file(imagePath);
    // 建立一個可以寫入 blob 的物件
    const blobStream = blob.createWriteStream();

    // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
    blobStream.on("finish", () => {
      // 設定檔案的存取權限
      const config = {
        action: "read", // 權限
        expires: "12-31-2500", // 網址的有效期限
      };
      // 取得檔案的網址
      blob.getSignedUrl(config, async (err, imageUrl) => {
        if (err) {
          return reject(err);
        }
        resolve(imageUrl);
      });
    });

    // 如果上傳過程中發生錯誤，會觸發 error 事件
    blobStream.on("error", reject);
    // 將檔案的 buffer 寫入 Firebase Storage blobStream
    blobStream.end(fileBuffer);
  });
};

module.exports = {
  compressImage,
  uploadToStorage,
};
